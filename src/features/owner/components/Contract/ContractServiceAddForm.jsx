import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useMemo, useRef } from "react";
import { useGetHouseServicesByHouseIdQuery } from "../../store/serviceApi";
import { useUpdateContractServicesMutation } from "../../store/contractApi";
import toast from "react-hot-toast";
import { Loader2, Save } from "lucide-react";
import ServiceTypeBadge from "../Service/ServiceTypeBadge";
import { formatCurrency } from "@/lib/format/currencyFormat";

// Schema chỉ cần xác thực mảng IDs
const ServiceIdsSchema = z.object({
  houseServiceIds: z.array(z.number()).optional(),
});

export default function ContractServiceAddForm({
  contract,
  houseId,
  onFormSubmitSuccess,
}) {
  const existingServiceIds = useMemo(
    () => contract.services?.map((s) => s.id) || [],
    [contract.services]
  );

  // FETCH TẤT CẢ DỊCH VỤ CỦA NHÀ TRỌ
  const { data: allServicesData, isLoading: loadingServices } =
    useGetHouseServicesByHouseIdQuery(houseId, { skip: !houseId });
  const allHouseServices = allServicesData || [];
  console.log(allHouseServices);

  const [updateServices, { isLoading: isMutating }] =
    useUpdateContractServicesMutation();

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(ServiceIdsSchema),
    defaultValues: { houseServiceIds: existingServiceIds },
  });
  // 🚨 2. PRELOAD TRẠNG THÁI CHECKBOX KHI DỮ LIỆU SERVICES ĐÃ CÓ
  const isServiceDataReady = !loadingServices && allHouseServices.length > 0;
  const isFormPreloadedRef = useRef(false); // Dùng để tránh reset khi user tương tác

  useEffect(() => {
    if (isServiceDataReady && !isFormPreloadedRef.current) {
      // Khi Services và Contract đã load, ta reset form với IDs đã gán
      reset({ houseServiceIds: existingServiceIds });
      isFormPreloadedRef.current = true;
    }
  }, [isServiceDataReady, existingServiceIds, reset]);

  const onSubmit = async (data) => {
    const payload = {
      contractId: contract.id,
      houseServiceIds: data.houseServiceIds || [], // Gửi mảng IDs đã được RHF quản lý
    };
    console.log(payload);

    try {
      await updateServices(payload).unwrap();

      toast.success("Đã thêm dịch vụ vào hợp đồng!");
      onFormSubmitSuccess();
    } catch (error) {
      toast.error(error.data?.message || "Thêm dịch vụ thất bại.");
    }
  };

  const isDisabled = isMutating || loadingServices;
  const currentCheckedIds = watch("houseServiceIds") || [];
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FieldGroup>
        <Field>
          <FieldLabel>Chọn Dịch vụ muốn thêm (Chưa có trong HĐ):</FieldLabel>
          <Controller
            name="houseServiceIds"
            control={control}
            render={({ field }) => (
              <ScrollArea className="h-64 border rounded-md p-3">
                {loadingServices && !isFormPreloadedRef.current ? (
                  <div className="flex justify-center py-4">
                    <Spinner />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {allHouseServices.map((service) => (
                      <div
                        key={service.id}
                        className="flex items-center justify-between space-x-2 py-1"
                      >
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={field.value.includes(service.id)}
                            onCheckedChange={(checked) => {
                              const newIds = checked
                                ? [...field.value, service.id]
                                : field.value.filter((id) => id !== service.id);
                              field.onChange(newIds);
                            }}
                            disabled={isDisabled}
                          />
                          <label className="text-sm font-medium">
                            {service.serviceName} (
                            {formatCurrency(service.price)})
                          </label>
                        </div>
                        <ServiceTypeBadge type={Number(service.method)} />
                      </div>
                    ))}
                    {allHouseServices.length === 0 && !loadingServices && (
                      <p className="text-muted-foreground text-sm py-4">
                        Chưa có dịch vụ nào cấu hình cho nhà này.
                      </p>
                    )}
                  </div>
                )}
              </ScrollArea>
            )}
          />
          <FieldError>{errors.houseServiceIds?.message}</FieldError>
        </Field>
      </FieldGroup>

      <div className="mt-6 flex justify-end">
        <Button
          type="submit"
          disabled={isDisabled}
          className="w-full sm:w-auto"
        >
          {isMutating ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Cập nhật Dịch vụ
        </Button>
      </div>
    </form>
  );
}

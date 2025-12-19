import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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
import { useTranslation } from "react-i18next";

// Schema mới với format object có lastMeterReading
const ServiceIdsSchema = z.object({
  houseServiceIds: z
    .array(
      z.object({
        houseServiceId: z.number(),
        serviceId: z.number(),
        lastMeterReading: z.number().optional(),
      })
    )
    .optional(),
});

export default function ContractServiceAddForm({
  contract,
  houseId,
  onFormSubmitSuccess,
}) {
  const { t } = useTranslation("contractinvoice");

  // FETCH TẤT CẢ DỊCH VỤ CỦA NHÀ TRỌ
  const { data: allServicesData, isLoading: loadingServices } =
    useGetHouseServicesByHouseIdQuery(houseId, { skip: !houseId });
  const allHouseServices = allServicesData || [];

  // Map các service đã có trong contract sang format mới
  const existingServices = useMemo(() => {
    if (!contract || !contract.services || contract.services.length === 0)
      return [];
    return contract.services.map((service) => ({
      houseServiceId: service.id || service.houseServiceId,
      serviceId: service.serviceId,
      lastMeterReading: service.lastMeterReading || undefined,
    }));
  }, [contract, contract?.services]);

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
    defaultValues: { houseServiceIds: existingServices },
  });

  //  2. PRELOAD TRẠNG THÁI CHECKBOX KHI DỮ LIỆU SERVICES ĐÃ CÓ
  const isServiceDataReady = !loadingServices && allHouseServices.length >= 0;
  const isFormPreloadedRef = useRef(false); // Dùng để tránh reset khi user tương tác

  useEffect(() => {
    // Reset form với existing services mỗi khi component mount hoặc contract thay đổi
    reset({ houseServiceIds: existingServices });
    isFormPreloadedRef.current = false;
  }, [contract?.id, reset]);

  useEffect(() => {
    if (isServiceDataReady && !isFormPreloadedRef.current) {
      // Khi Services đã load, ta update form với services đã gán
      reset({ houseServiceIds: existingServices });
      isFormPreloadedRef.current = true;
    }
  }, [isServiceDataReady, existingServices, reset]);

  const onSubmit = async (data) => {
    // Format lại data: chỉ gửi các service được check, và chỉ thêm lastMeterReading cho method = 0
    const formattedServices = (data.houseServiceIds || []).map((service) => {
      const houseService = allHouseServices.find(
        (hs) => hs.id === service.houseServiceId
      );
      const result = {
        houseServiceId: service.houseServiceId,
        serviceId: service.serviceId,
      };
      // Chỉ thêm lastMeterReading nếu method = 0 và có giá trị (kể cả 0)
      if (
        houseService &&
        Number(houseService.method) === 0 &&
        service.lastMeterReading !== undefined &&
        service.lastMeterReading !== null
      ) {
        result.lastMeterReading = Number(service.lastMeterReading);
      }
      return result;
    });

    const payload = {
      contractId: contract.id,
      houseServiceIds: formattedServices,
    };

    try {
      await updateServices(payload).unwrap();
      toast.success(t("AddServiceToContract"));
      onFormSubmitSuccess();
    } catch (error) {
      toast.error(error.data?.message || t("AddServiceFailed"));
    }
  };

  const isDisabled = isMutating || loadingServices;
  const currentServices = watch("houseServiceIds") || [];

  // Helper function để kiểm tra service đã được check chưa
  const isServiceChecked = (houseServiceId) => {
    return currentServices.some((s) => s.houseServiceId === houseServiceId);
  };

  // Helper function để lấy service từ form data
  const getServiceFromForm = (houseServiceId) => {
    return currentServices.find((s) => s.houseServiceId === houseServiceId);
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FieldGroup>
        <Field>
          <FieldLabel>{t("SelectServicesToAdd")}</FieldLabel>
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
                  <div className="space-y-3">
                    {allHouseServices.map((service) => {
                      const isChecked = isServiceChecked(service.id);
                      const serviceInForm = getServiceFromForm(service.id);
                      const isMethod0 = Number(service.method) === 0;

                      return (
                        <div
                          key={service.id}
                          className="space-y-2 border-b pb-2 last:border-b-0"
                        >
                          <div className="flex items-center justify-between space-x-2">
                            <div className="flex items-center space-x-2 flex-1">
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={(checked) => {
                                  const currentValues = field.value || [];
                                  if (checked) {
                                    // Thêm service mới
                                    const newService = {
                                      houseServiceId: service.id,
                                      serviceId: service.serviceId,
                                      ...(isMethod0 && {
                                        lastMeterReading:
                                          serviceInForm?.lastMeterReading ||
                                          undefined,
                                      }),
                                    };
                                    field.onChange([
                                      ...currentValues,
                                      newService,
                                    ]);
                                  } else {
                                    // Xóa service
                                    field.onChange(
                                      currentValues.filter(
                                        (s) => s.houseServiceId !== service.id
                                      )
                                    );
                                  }
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
                          {/* Hiển thị input lastMeterReading nếu method = 0 và đã được check */}
                          {isChecked && isMethod0 && (
                            <div className="ml-7">
                              <Field>
                                <FieldLabel className="text-xs">
                                  {t("LastMeterReading")}:
                                </FieldLabel>
                                <Input
                                  type="number"
                                  min="0"
                                  value={serviceInForm?.lastMeterReading || ""}
                                  onChange={(e) => {
                                    const currentValues = field.value || [];
                                    const updatedValues = currentValues.map(
                                      (s) =>
                                        s.houseServiceId === service.id
                                          ? {
                                              ...s,
                                              lastMeterReading: e.target.value
                                                ? Number(e.target.value)
                                                : 0,
                                            }
                                          : s
                                    );
                                    field.onChange(updatedValues);
                                  }}
                                  disabled={isDisabled}
                                  className="w-32"
                                  placeholder="0"
                                />
                              </Field>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {allHouseServices.length === 0 && !loadingServices && (
                      <p className="text-muted-foreground text-sm py-4">
                        {t("NoServicesConfigured")}
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
          {t("UpdateServices")}
        </Button>
      </div>
    </form>
  );
}

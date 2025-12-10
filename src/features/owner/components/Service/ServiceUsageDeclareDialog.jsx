// src/features/service/components/ServiceUsageDeclareDialog.jsx
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import React, { useEffect, useMemo, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DeclareServiceUsageSchema } from "@/lib/validation/service";
import { useGetCurrentContractByIdQuery } from "../../store/contractApi";
import {
  useDeclareServiceUsageMutation,
  useGetLatestReadingQuery,
} from "../../store/serviceApi";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

// Component con để fetch chỉ số tháng trước của từng service
const PreviousReadingInput = ({ roomId, serviceId, label }) => {
  const {
    data: latestReading,
    isLoading,
    isFetching,
  } = useGetLatestReadingQuery(
    { roomId, serviceId },
    {
      skip: !roomId || !serviceId,
    }
  );

  // ✅ Đảm bảo lấy giá trị đúng từ response
  const prevReading =
    latestReading !== undefined && latestReading !== null ? latestReading : 0;

  console.log(
    `Service ${serviceId} - Latest Reading:`,
    latestReading,
    "Prev:",
    prevReading
  );

  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <Input
        type="number"
        value={isLoading || isFetching ? "" : prevReading}
        readOnly
        className="bg-gray-50"
        placeholder={isLoading || isFetching ? "Đang tải..." : "0"}
      />
      {isLoading && <span className="text-xs text-gray-400">Đang tải...</span>}
    </Field>
  );
};

const ServiceUsageDeclareDialog = ({ open, onOpenChange, roomId }) => {
  const prevRoomIdRef = useRef(null);

  const {
    data: contract,
    isLoading: loadingContract,
    isError: contractError,
  } = useGetCurrentContractByIdQuery(roomId, {
    skip: !roomId || !open,
  });

  const services = contract?.services || [];

  const servicesToDeclare = useMemo(() => {
    return services.filter((s) => s.method === "0");
  }, [services]);

  const [declareServiceUsage, { isLoading: isDeclaring }] =
    useDeclareServiceUsageMutation();

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(DeclareServiceUsageSchema),
    defaultValues: {
      roomId: roomId,
      month: currentMonth,
      year: currentYear,
      serviceUsages: [],
    },
  });

  const { fields } = useFieldArray({
    control,
    name: "serviceUsages",
  });

  // Reset form khi mở dialog
  useEffect(() => {
    if (open && contract && servicesToDeclare.length > 0) {
      if (prevRoomIdRef.current !== roomId) {
        const newServiceUsages = servicesToDeclare.map((service) => ({
          serviceId: service.serviceId,
          currReading: 0,
        }));

        reset({
          roomId: roomId,
          month: currentMonth,
          year: currentYear,
          serviceUsages: newServiceUsages,
        });

        prevRoomIdRef.current = roomId;
      }
    }
  }, [
    open,
    contract,
    servicesToDeclare,
    roomId,
    currentMonth,
    currentYear,
    reset,
  ]);

  // Reset khi dialog đóng
  useEffect(() => {
    if (!open) {
      prevRoomIdRef.current = null;
    }
  }, [open]);

  const onSubmit = async (data) => {
    try {
      const validServiceUsages = data.serviceUsages.filter(
        (usage) => usage.currReading !== null && usage.currReading !== undefined
      );

      if (validServiceUsages.length === 0) {
        toast.error("Vui lòng nhập ít nhất một chỉ số dịch vụ.");
        return;
      }

      const payload = {
        ...data,
        serviceUsages: validServiceUsages,
      };

      console.log("Payload khai báo chỉ số:", payload);
      await declareServiceUsage(payload).unwrap();
      toast.success("Khai báo chỉ số thành công!");
      onOpenChange(false);
    } catch (error) {
      toast.error(error.data?.message || "Khai báo chỉ số thất bại.");
      console.error("Declare service usage error:", error);
    }
  };

  const isDisabled = isDeclaring || loadingContract;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>
              Khai báo chỉ số dịch vụ cho phòng {contract?.roomName}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <input
              type="hidden"
              {...register("roomId", { valueAsNumber: true })}
            />
            <input
              type="hidden"
              {...register("month", { valueAsNumber: true })}
            />
            <input
              type="hidden"
              {...register("year", { valueAsNumber: true })}
            />

            <div className="flex justify-between text-sm text-gray-600">
              <span>
                Kỳ: {currentMonth}/{currentYear}
              </span>
              <span>Hợp đồng: {contract?.id}</span>
            </div>

            {loadingContract ? (
              <div className="flex items-center justify-center h-24">
                <Loader2 className="h-6 w-6 animate-spin mr-2" /> Đang tải dịch
                vụ...
              </div>
            ) : contractError ? (
              <div className="text-red-500">
                Không thể tải thông tin hợp đồng.
              </div>
            ) : servicesToDeclare.length === 0 ? (
              <div className="text-gray-500">
                Phòng này không có dịch vụ nào tính theo chỉ số.
              </div>
            ) : (
              <ScrollArea className="h-60 border rounded-md p-3">
                {fields.map((field, index) => {
                  const service = servicesToDeclare.find(
                    (s) => s.serviceId === field.serviceId
                  );

                  return (
                    <div key={field.id} className="grid grid-cols-2 gap-4 py-2">
                      <Field>
                        <FieldLabel>
                          {service?.serviceName} (Giá:{" "}
                          {service?.price?.toLocaleString()} VNĐ)
                        </FieldLabel>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Chỉ số tháng này"
                          {...register(`serviceUsages.${index}.currReading`, {
                            valueAsNumber: true,
                          })}
                          disabled={isDisabled}
                          min={0}
                        />
                        <FieldError>
                          {errors.serviceUsages?.[index]?.currReading?.message}
                        </FieldError>
                      </Field>

                      <PreviousReadingInput
                        roomId={roomId}
                        serviceId={field.serviceId}
                        label="Chỉ số tháng trước"
                      />

                      <input
                        type="hidden"
                        {...register(`serviceUsages.${index}.serviceId`, {
                          valueAsNumber: true,
                        })}
                      />
                    </div>
                  );
                })}
              </ScrollArea>
            )}
            <FieldError>{errors.serviceUsages?.message}</FieldError>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={isDeclaring}>
                Hủy
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isDisabled || servicesToDeclare.length === 0}
            >
              {isDeclaring && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Khai báo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceUsageDeclareDialog;

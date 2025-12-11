import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Save, Calendar as CalendarIcon, Loader2 } from "lucide-react";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import toast from "react-hot-toast";
import { format, parseISO } from "date-fns";
import { PAYMENT_CYCLE_OPTIONS } from "@/assets/contract/paymentOptions";
import { useUpdateContractInforMutation } from "../../store/contractApi"; // ✅ Import hook update
import { useEffect, useMemo } from "react";
import { ContractInforEditSchema } from "@/lib/validation/contract";

export default function ContractInforEditForm({
  contractId,
  initialData, // Dữ liệu hợp đồng hiện tại
  onFormSubmitSuccess,
}) {
  // ✅ Mutation Update
  const [updateContractInfor, { isLoading: isMutating }] =
    useUpdateContractInforMutation();

  // Chuyển đổi initialData để phù hợp với form (string date -> Date object)
  const defaultValues = useMemo(
    () => ({
      id: initialData?.id || contractId,
      startDate: initialData?.startDate
        ? parseISO(initialData.startDate)
        : undefined,
      endDate: initialData?.endDate ? parseISO(initialData.endDate) : undefined,
      rent: initialData?.rent || 0,
      deposit: initialData?.deposit || 0,
      penaltyAmount: initialData?.penaltyAmount || 50000,
      paymentCycle: initialData?.paymentCycle || 1,
    }),
    [initialData, contractId]
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(ContractInforEditSchema),
    defaultValues: defaultValues,
  });

  // Reset form khi initialData thay đổi
  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const isDisabled = isMutating;

  const onSubmit = async (data) => {
    // 1. Format Dates và loại bỏ ID khỏi payload gửi lên
    const { id, ...formData } = data;

    const payload = {
      ...formData,
      startDate: format(data.startDate, "yyyy-MM-dd"),
      endDate: format(data.endDate, "yyyy-MM-dd"),
    };

    try {
      // Gọi mutation update
      await updateContractInfor({ contractId: id, ...payload }).unwrap();
      toast.success("Cập nhật thông tin hợp đồng thành công!");
      onFormSubmitSuccess();
    } catch (error) {
      toast.error(error.data?.message || "Cập nhật hợp đồng thất bại.");
      console.error("Contract update error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register("id", { valueAsNumber: true })} />
      <FieldGroup>
        {/* ------------------- THÔNG TIN CƠ BẢN ------------------- */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {/* Rent & Deposit */}
          <Field>
            <FieldLabel>Giá Thuê (*)</FieldLabel>
            <Input
              type="number"
              {...register("rent", { valueAsNumber: true })}
              disabled={isDisabled}
            />
            <FieldError>{errors.rent?.message}</FieldError>
          </Field>
          <Field>
            <FieldLabel>Tiền Cọc (*)</FieldLabel>
            <Input
              type="number"
              {...register("deposit", { valueAsNumber: true })}
              disabled={isDisabled}
            />
            <FieldError>{errors.deposit?.message}</FieldError>
          </Field>
          {/* Payment Cycle & Penalty */}
          <Field>
            <FieldLabel>Chu kỳ TT(*)</FieldLabel>
            <Controller
              name="paymentCycle"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(val) => field.onChange(Number(val))}
                  value={field.value?.toString()}
                  disabled={isDisabled}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_CYCLE_OPTIONS.map((val) => (
                      <SelectItem key={val} value={val.toString()}>
                        {val} Tháng/lần
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError>{errors.paymentCycle?.message}</FieldError>
          </Field>
          <Field>
            <FieldLabel>Phí Phạt (*)</FieldLabel>
            <Input
              type="number"
              {...register("penaltyAmount", { valueAsNumber: true })}
              disabled={isDisabled}
            />
            <FieldError>{errors.penaltyAmount?.message}</FieldError>
          </Field>
        </div>
        <div className="grid gap-4 grid-cols-2">
          {/* Start/End Date */}
          <Field className={"col-span-full sm:col-span-1"}>
            <FieldLabel>Ngày Bắt Đầu (*)</FieldLabel>
            <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant={"outline"} disabled={isDisabled}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value
                        ? format(new Date(field.value), "dd/MM/yyyy")
                        : "Chọn ngày"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            <FieldError>{errors.startDate?.message}</FieldError>
          </Field>
          <Field className={"col-span-full sm:col-span-1"}>
            <FieldLabel>Ngày Kết Thúc (*)</FieldLabel>
            <Controller
              name="endDate"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant={"outline"} disabled={isDisabled}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value
                        ? format(new Date(field.value), "dd/MM/yyyy")
                        : "Chọn ngày"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            <FieldError>{errors.endDate?.message}</FieldError>
          </Field>
        </div>
      </FieldGroup>
      {/* ------------------- SUBMIT ------------------- */}
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
          Cập Nhật Hợp Đồng
        </Button>
      </div>
    </form>
  );
}

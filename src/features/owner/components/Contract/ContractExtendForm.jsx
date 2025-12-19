import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ContractExtendSchema } from "@/lib/validation/contract"; //  Import Schema
import { useExtendContractMutation } from "../../store/contractApi";
import toast from "react-hot-toast";
import { format, addMonths } from "date-fns";
import { Clock, Calendar as CalendarIcon, Loader2, Save } from "lucide-react";
import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format/currencyFormat";
import { useTranslation } from "react-i18next";

export default function ContractExtendForm({ contract, onFormSubmitSuccess }) {
  const { t } = useTranslation("contractinvoice");
  const [extendContract, { isLoading }] = useExtendContractMutation();

  const currentEndDate = useMemo(
    () => new Date(contract.endDate),
    [contract.endDate]
  );

  // Mặc định ngày kết thúc mới là 12 tháng sau ngày hiện tại
  const suggestedEndDate = useMemo(
    () => addMonths(currentEndDate, 12),
    [currentEndDate]
  );

  //  SETUP RHF
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(ContractExtendSchema),
    defaultValues: {
      newEndDate: suggestedEndDate, // Giá trị mặc định gợi ý
      newRent: contract.rent,
      note: "",
    },
  });

  const watchNewEndDate = watch("newEndDate");

  const onSubmit = async (data) => {
    // 1. Chuẩn bị payload
    const payload = {
      newEndDate: format(data.newEndDate, "yyyy-MM-dd"),
      // Chỉ gửi newRent nếu nó khác rent cũ (hoặc gửi luôn nếu API chấp nhận)
      newRent: data.newRent,
      note: data.note || null,
    };

    const toastId = toast.loading(
      `${t("ExtendingContractLoading")} ${contract.id}...`
    );

    try {
      await extendContract({ contractId: contract.id, data: payload }).unwrap();

      toast.success(t("ContractExtendedSuccessMessage"), { id: toastId });
      onFormSubmitSuccess();
    } catch (error) {
      toast.error(error.data?.message || t("ExtendFailed"), { id: toastId });
      console.error("Contract extend error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FieldGroup>
        {/* Current End Date */}
        <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
          <span className="font-medium">{t("OldEndDateLabel")}</span>
          <span>{format(currentEndDate, "PP")}</span>
        </div>

        {/* New End Date */}
        <Field>
          <FieldLabel>{t("NewEndDateLabel")} (*)</FieldLabel>
          <Controller
            name="newEndDate"
            control={control}
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal")}
                    disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value
                      ? format(field.value, "dd/MM/yyyy")
                      : t("SelectDate")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  {/* Cho phép chọn ngày sau ngày hết hạn cũ */}
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                    disabled={(date) => date < currentEndDate}
                  />
                </PopoverContent>
              </Popover>
            )}
          />
          <FieldError>{errors.newEndDate?.message}</FieldError>
        </Field>

        {/* New Rent */}
        <Field>
          <FieldLabel>{t("NewRentLabel")}</FieldLabel>
          <Input
            type="number"
            {...register("newRent", { valueAsNumber: true })}
            placeholder={`${t("DefaultRent")}: ${formatCurrency(contract.rent)}`}
            disabled={isLoading}
          />
          <FieldError>{errors.newRent?.message}</FieldError>
        </Field>

        {/* Note */}
        <Field>
          <FieldLabel>{t("ExtendNoteLabel")}</FieldLabel>
          <Textarea
            {...register("note")}
            placeholder={t("ExtendNotePlaceholder")}
            disabled={isLoading}
          />
        </Field>
      </FieldGroup>

      <div className="mt-6 flex justify-end">
        <Button
          type="submit"
          disabled={isLoading || !isDirty}
          className="w-full sm:w-auto"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Clock className="h-4 w-4 mr-2" />
          )}
          {t("ExtendContract")}
        </Button>
      </div>
    </form>
  );
}

import { ServiceSchema } from "@/lib/validation/service";
import React, { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { useCreateOrUpdateServiceMutation } from "../../store/serviceApi";
import toast from "react-hot-toast";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { zodResolver } from "@hookform/resolvers/zod";
import { TYPE_OPTIONS } from "./../../../../assets/service/typeOptions";
import { useTranslation } from "react-i18next";

const ServiceUpsertForm = ({ initialData = null, onFormSubmitSuccess }) => {
  const { t } = useTranslation("service");
  const [createOrUpdateService, { isLoading }] =
    useCreateOrUpdateServiceMutation();

  const isEditMode = !!initialData?.id;
  const defaultValues = useMemo(
    () => ({
      id: initialData?.id || null,
      name: initialData?.name || "",
      unit: initialData?.unit || "Tháng",
      type: initialData?.type?.toString() || "0",
    }),
    [initialData]
  );
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(ServiceSchema),
    defaultValues: defaultValues,
  });
  const onSubmit = async (data) => {
    const payload = { ...data };
    try {
      await createOrUpdateService(payload).unwrap();
      const action = isEditMode ? t("Update") : t("Add");
      toast.success(`${action} thành công!`);
      toast.success(`${t(action)} ${t("Success")}`);
      if (!isEditMode) {
        reset();
      }
      onFormSubmitSuccess();
    } catch (error) {
      toast.error(isEditMode ? t("UpdateFailed") : t("UpdateFailed"));
      console.error(error);
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {isEditMode && (
        <input type="hidden" {...register("id", { valueAsNumber: true })} />
      )}
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">{t("ServiceName")}</FieldLabel>
          <Input id="name" {...register("name")} placeholder="điện, nước.." />
          <FieldError>{errors.name?.message} </FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="unit">{t("Unit")}</FieldLabel>
          <Input
            id="unit"
            {...register("unit")}
            placeholder="Ví dụ: Tháng, Người, Lần..."
            disabled={isLoading}
          />
          <FieldError>{errors.unit?.message}</FieldError>
        </Field>
        {/* Type Select */}
        <Field>
          <FieldLabel htmlFor="type">{t("Method")}</FieldLabel>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("SelectMethod")} />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value.toString()}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError>{errors.type?.message}</FieldError>
        </Field>
      </FieldGroup>
      <Button type="submit" className={"w-full"} disabled={isLoading}>
        {isLoading ? <Spinner /> : isEditMode ? t("Update") : t("Add")}
      </Button>
    </form>
  );
};

export default ServiceUpsertForm;

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

const TYPE_OPTIONS = [
  { value: 0, label: "Tính theo công tơ (Điện, Nước)" },
  { value: 1, label: "Tính theo đầu người (Wifi, Giữ xe)" },
  { value: 2, label: "Tính theo phòng (Vệ sinh, Thu rác)" },
];
const ServiceUpsertForm = ({ initialData = null, onFormSubmitSuccess }) => {
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
      const action = isEditMode ? "Cập nhật" : "Thêm mới";
      toast.success(`${action} thành công!`);
      if (!isEditMode) {
        reset();
      }
      onFormSubmitSuccess();
    } catch (error) {
      toast.error(isEditMode ? "Cập nhật thất bại!" : "Thêm mới thất bại!");
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
          <FieldLabel htmlFor="name">Tên dịch vụ</FieldLabel>
          <Input id="name" {...register("name")} placeholder="điện, nước.." />
          <FieldError>{errors.name?.message} </FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="unit">Đơn Vị Tính (*)</FieldLabel>
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
          <FieldLabel htmlFor="type">Loại dịch vụ (*)</FieldLabel>
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
                  <SelectValue placeholder="Chọn loại tính tiền" />
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
        {isLoading ? <Spinner /> : isEditMode ? "Cập nhật" : "Thêm mới"}
      </Button>
    </form>
  );
};

export default ServiceUpsertForm;

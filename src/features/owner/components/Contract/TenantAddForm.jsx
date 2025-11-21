import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TenantSchema } from "@/lib/validation/contract";
import { useAddTenantMutation } from "../../store/contractApi";
import toast from "react-hot-toast";
import { Loader2, UserPlus } from "lucide-react";
import React from "react";

const defaultValues = { fullName: "", phoneNumber: "", email: "" };

export default function TenantAddForm({ contractId, onFormSubmitSuccess }) {
  const [addTenant, { isLoading }] = useAddTenantMutation();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(TenantSchema),
    defaultValues: defaultValues,
  });

  const onSubmit = async (data) => {
    try {
      await addTenant({ contractId, tenantData: data }).unwrap();

      toast.success(`Đã thêm khách thuê ${data.fullName} vào hợp đồng.`);
      reset();
      onFormSubmitSuccess();
    } catch (error) {
      toast.error(error.data?.message || "Thêm khách thuê thất bại.");
      console.error("Add tenant error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FieldGroup>
        {/* Full Name */}
        <Field>
          <FieldLabel htmlFor="fullName">Họ Tên (*)</FieldLabel>
          <Input {...register("fullName")} disabled={isLoading} />
          <FieldError>{errors.fullName?.message}</FieldError>
        </Field>

        {/* Phone Number */}
        <Field>
          <FieldLabel htmlFor="phoneNumber">Số Điện Thoại (*)</FieldLabel>
          <Input {...register("phoneNumber")} disabled={isLoading} />
          <FieldError>{errors.phoneNumber?.message}</FieldError>
        </Field>

        {/* Email */}
        <Field>
          <FieldLabel htmlFor="email">Email (*)</FieldLabel>
          <Input type="email" {...register("email")} disabled={isLoading} />
          <FieldError>{errors.email?.message}</FieldError>
        </Field>
      </FieldGroup>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>Thêm Khách thuê</>
        )}
      </Button>
    </form>
  );
}

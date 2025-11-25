// File: src/features/owner/components/Contract/TenantCreateForm.jsx

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";

import { useCreateTenantMutation } from "../../store/tenantApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Loader2, Save } from "lucide-react";
import { NewTenantSchema } from "@/lib/validation/tenant";
import { cn } from "@/lib/utils";
export default function TenantCreateForm({
  onFormSubmitSuccess, // Hàm này nhận data tenant đã tạo và đóng dialog
}) {
  const [createTenant, { isLoading }] = useCreateTenantMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(NewTenantSchema),
    defaultValues: {
      fullName: "",
      idNumber: "",
      phoneNumber: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    const rawPayload = {
      ...data,
      username: data.phoneNumber,
    };
    const formData = new FormData();
    Object.keys(rawPayload).forEach((key) => {
      formData.append(key, rawPayload[key]);
    });

    console.log("Payload gửi đi (dạng FormData):", formData);

    try {
      const result = await createTenant(formData).unwrap();
      if (result.code === 1000 && result.result) {
        toast.success("Tạo Tenant thành công!");
        // Gọi callback với thông tin tenant đã tạo (bao gồm id nếu API trả về)
        onFormSubmitSuccess(result.result);
      } else {
        toast.error(result.message || "Tạo Tenant thất bại.");
      }
    } catch (error) {
      console.error("Create Tenant Error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FieldGroup className="grid gap-4 md:grid-cols-2">
        <Field>
          <FieldLabel>Họ Tên (*)</FieldLabel>
          <Input {...register("fullName")} disabled={isLoading} />
          <FieldError>{errors.fullName?.message}</FieldError>
        </Field>
        <Field>
          <FieldLabel>CCCD (*)</FieldLabel>
          <Input {...register("idNumber")} disabled={isLoading} />
          <FieldError>{errors.idNumber?.message}</FieldError>
        </Field>
        <Field>
          <FieldLabel>Số điện thoại (*)</FieldLabel>
          <Input
            {...register("phoneNumber")}
            disabled={isLoading}
            className="bg-gray-100 dark:bg-gray-800"
          />
          <FieldError>{errors.phoneNumber?.message}</FieldError>
        </Field>
        <Field>
          <FieldLabel>Email (*)</FieldLabel>
          <Input type="email" {...register("email")} disabled={isLoading} />
          <FieldError>{errors.email?.message}</FieldError>
        </Field>
        <Field>
          <FieldLabel>Mật khẩu (*)</FieldLabel>
          <Input
            type="password"
            {...register("password")}
            disabled={isLoading}
          />
          <FieldError>{errors.password?.message}</FieldError>
        </Field>
        {/* Username tự động lấy từ phoneNumber, không cần hiển thị */}
      </FieldGroup>
      <div className="flex justify-end pt-4 border-t">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Tạo Tenant
        </Button>
      </div>
    </form>
  );
}

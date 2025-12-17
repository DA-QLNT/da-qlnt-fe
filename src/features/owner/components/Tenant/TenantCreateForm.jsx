// File: src/features/owner/components/Contract/TenantCreateForm.jsx

import React from "react";
import { Controller, useForm } from "react-hook-form";
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
import { CalendarIcon, Loader2, Save } from "lucide-react";
import { NewTenantSchema } from "@/lib/validation/tenant";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns/format";
import { useTranslation } from "react-i18next";
export default function TenantCreateForm({ onFormSubmitSuccess }) {
  const { t } = useTranslation("usercontent");

  const [createTenant, { isLoading }] = useCreateTenantMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm({
    resolver: zodResolver(NewTenantSchema),
    defaultValues: {
      fullName: "",
      idNumber: "",
      phoneNumber: "",
      email: "",
      address: "",
      dob: undefined,
      // password: "",
    },
  });

  const onSubmit = async (data, event) => {
    //  Quan trọng: Ngăn form cha bị submit
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const formattedDob = data.dob ? format(data.dob, "yyyy-MM-dd") : null;
    const rawPayload = {
      ...data,
      username: data.phoneNumber,
      password: "123456789",
      dob: formattedDob,
    };
    const formData = new FormData();
    Object.keys(rawPayload).forEach((key) => {
      formData.append(key, rawPayload[key]);
    });

    console.log("Payload gửi đi", formData);

    try {
      const result = await createTenant(formData).unwrap();
      if (result.code === 1000 && result.result) {
        toast.success(`${t("CreateSuccess")}`);
        // Gọi callback với thông tin tenant đã tạo (bao gồm id nếu API trả về)
        onFormSubmitSuccess(result.result);
      } else {
        toast.error(result.message || `${t("CreateFail")}`);
      }
    } catch (error) {
      console.error("Create Tenant Error:", error);
    }
  };
  // ✅ FIX: Handler riêng để đảm bảo ngăn submit
  const handleFormSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleSubmit(onSubmit)(e);
  };
  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <FieldGroup className="grid gap-4 md:grid-cols-2">
        <Field>
          <FieldLabel>{t("FullName")}*</FieldLabel>
          <Input {...register("fullName")} disabled={isLoading} />
          <FieldError>{errors.fullName?.message}</FieldError>
        </Field>
        <Field>
          <FieldLabel>{t("IdPerson")}*</FieldLabel>
          <Input {...register("idNumber")} disabled={isLoading} />
          <FieldError>{errors.idNumber?.message}</FieldError>
        </Field>
        <Field>
          <FieldLabel>{t("PhoneNumber")}*</FieldLabel>
          <Input
            {...register("phoneNumber")}
            disabled={isLoading}
            className="bg-gray-100 dark:bg-gray-800"
          />
          <FieldError>{errors.phoneNumber?.message}</FieldError>
        </Field>
        <Field>
          <FieldLabel>Email*</FieldLabel>
          <Input type="email" {...register("email")} disabled={isLoading} />
          <FieldError>{errors.email?.message}</FieldError>
        </Field>
        <Field className="md:col-span-2">
          <FieldLabel>{t("Address")}*</FieldLabel>
          <Input {...register("address")} disabled={isLoading} />
          <FieldError>{errors.address?.message}</FieldError>
        </Field>
        <Field className="md:col-span-2">
          <FieldLabel>{t("Dob")}*</FieldLabel>
          <Controller
            name="dob"
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
                      : `${t("SelectDob")}`}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    captionLayout="dropdown"
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          />
          <FieldError>{errors.dob?.message}</FieldError>
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
          {t("Create")}
        </Button>
      </div>
    </form>
  );
}

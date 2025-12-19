import React from "react";
import { useTranslation } from "react-i18next";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TenantEditSchema } from "@/lib/validation/tenant";
import { format } from "date-fns/format";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar1 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Spinner } from "@/components/ui/spinner";
import { useUpdateTenantMutation } from "../../store/tenantApi";

const TenantEditForm = ({ tenant, onFormSubmitSuccess }) => {
  const { t } = useTranslation("usercontent");
  const [updateUser, { isLoading }] = useUpdateTenantMutation();
  const defaultValues = {
    id: tenant.id,
    username: tenant.username,
    fullName: tenant.fullName,
    email: tenant.email,
    address: tenant.address,
    phoneNumber: tenant.phoneNumber,
    dob: tenant.dob ? new Date(tenant.dob) : undefined,
    avatar: undefined,
  };
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(TenantEditSchema),
    defaultValues: defaultValues,
  });
  const selectedFile = watch("avatar");
  const onSubmit = async (data) => {
    let formattedDob = null;
    if (data.dob && data.dob instanceof Date) {
      formattedDob = format(data.dob, "yyyy-MM-dd");
    }
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (key !== "avatar" && key !== "dob") {
        formData.append(key, data[key]);
      }
    });
    if (formattedDob) {
      formData.append("dob", formattedDob);
    }
    const file = data.avatar?.[0];
    if (file) {
      formData.append("avatar", file);
    }
    console.log(formData);

    try {
      const result = await updateUser(formData).unwrap();
      if (result.code === 1000) {
        toast.success(`${t("EditSuccess")}`);
        onFormSubmitSuccess();
      } else {
        toast.error(`${t("UpdateFail")}`);
        console.error("RTK query error update: ", result.code);
      }
    } catch (error) {
      toast.error(`${t("UpdateFail")}`);
      console.error("RTK query error update: ", error);
    }
  };
  const filePreview = selectedFile?.[0]
    ? URL.createObjectURL(selectedFile[0])
    : tenant.avatarUrl || "/userDefault.png";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
      <FieldGroup>
        <div className="flex flex-col items-center space-y-4 pb-4 border-b">
          <div className="relative w-30 h-30 rounded-full overflow-hidden border-2 shrink-0">
            <img
              src={filePreview}
              alt="Avatar"
              className="w-full object-cover"
            />
          </div>
          <Input
            id="avatar"
            type={"file"}
            accept="image/*"
            {...register("avatar")}
            disabled={isLoading}
            className={"w-75 file:text-primary file:font-semibold"}
          />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Field>
            <FieldLabel>{t("UserName")}</FieldLabel>
            {/* id được ẩn để gửi đi */}
            <Input
              type={"hidden"}
              {...register("id", { valueAsNumber: true })}
            />
            <Input
              value={tenant.username}
              readOnly
              disabled
              className={"bg-gray-100 dark:bg-gray-800"}
            />
          </Field>
          <Field>
            <FieldLabel>{t("FullName")}</FieldLabel>
            <Input
              id="fullName"
              {...register("fullName")}
              disabled={isLoading}
            />
            <FieldError>{errors.fullName?.message}</FieldError>
          </Field>
          <Field>
            <FieldLabel>{t("Email")}</FieldLabel>
            <Input
              id="email"
              type={"email"}
              {...register("email")}
              disabled={isLoading}
            />
            <FieldError>{errors.email?.message}</FieldError>
          </Field>
          <Field>
            <FieldLabel>{t("Address")}</FieldLabel>
            <Input
              id="address"
              type={"address"}
              {...register("address")}
              disabled={isLoading}
            />
            <FieldError>{errors.address?.message}</FieldError>
          </Field>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Field>
            <FieldLabel>{t("PhoneNumber")}</FieldLabel>
            <Input
              id="phoneNumber"
              {...register("phoneNumber")}
              disabled={isLoading}
              className={"w-full"}
            />
            <FieldError>{errors.phoneNumber?.message}</FieldError>
          </Field>
          <Field>
            <FieldLabel>{t("Dob")}</FieldLabel>
            <Controller
              name="dob"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                      disabled={isLoading}
                    >
                      <Calendar1 />
                      {field.value ? (
                        format(field.value, "dd/MM/yyyy")
                      ) : (
                        <span>{t("SelectDob")}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
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
        </div>
        <div className="grid grid-cols-2 gap-4"></div>
      </FieldGroup>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? <Spinner className={"text-white size-4"} /> : t("Update")}
      </Button>
    </form>
  );
};

export default TenantEditForm;

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { UserAddSchema } from "@/lib/validation/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns/format";
import { Calendar1, ImageIcon } from "lucide-react";

import React from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useCreateUserMutation } from "../../store/userApi";

const defaultValues = {
  username: "",
  password: "",
  email: "",
  address: "",
  phoneNumber: "",
  dob: undefined,
};

const UserAddForm = ({ onFormSubmitSuccess }) => {
  const [createUser, { isLoading }] = useCreateUserMutation();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(UserAddSchema),
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

    try {
      const result = await createUser(formData).unwrap();
      if (result.code === 1000) {
        toast.success(`Create successfully user ${result.result.username} `);
        reset();
        onFormSubmitSuccess();
      } else {
        console.error("RTK query error: ", result.code);
      }
    } catch (error) {
      console.error("RTK query error: ", error);
    }
  };

  const filePreview = selectedFile?.[0]
    ? URL.createObjectURL(selectedFile[0])
    : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
      <FieldGroup>
        <div className="flex gap-2">
          <Field>
            <FieldLabel htmlFor="username">Username(*)</FieldLabel>
            <Input
              id="username"
              {...register("username")}
              disabled={isLoading}
            />
            <FieldError>{errors.username?.message}</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Password(*)</FieldLabel>
            <Input
              id="password"
              {...register("password")}
              disabled={isLoading}
            />
            <FieldError>{errors.password?.message}</FieldError>
          </Field>
        </div>
        <div className="flex gap-2">
          <Field>
            <FieldLabel htmlFor="email">Email(*)</FieldLabel>
            <Input id="email" {...register("email")} disabled={isLoading} />
            <FieldError>{errors.username?.message}</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="phoneNumber">Phone Number(*)</FieldLabel>
            <Input
              id="phoneNumber"
              {...register("phoneNumber")}
              disabled={isLoading}
            />
            <FieldError>{errors.phoneNumber?.message}</FieldError>
          </Field>
        </div>
        <div className="flex gap-2">
          <Field>
            <FieldLabel htmlFor="address">Address(*)</FieldLabel>
            <Input id="address" {...register("address")} disabled={isLoading} />
            <FieldError>{errors.address?.message}</FieldError>
          </Field>
          <Field>
            <FieldLabel>Date of Birth(*)</FieldLabel>
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
                      <Calendar1 className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Select dob</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <Calendar
                      mode="single"
                      captionLayout="dropdown"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            <FieldError>{errors.dob?.message}</FieldError>
          </Field>
        </div>
        {/* avatar */}
        <Field>
          <FieldLabel htmlFor="avatar">Avatar</FieldLabel>
          <div className="flex items-center space-x-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border">
              {filePreview ? (
                <img
                  src={filePreview}
                  alt="Avatar Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-gray-400">
                  <ImageIcon className="w-8 h-8" />
                </div>
              )}
            </div>
            <Input
              id="avatar"
              type="file"
              accept="image/*"
              {...register("avatar")}
              disabled={isLoading}
              className={"file:text-primary file:font-semibold"}
            />
          </div>
          <FieldError>{errors.avatar?.message}</FieldError>
        </Field>
      </FieldGroup>
      <Button type="submit" className={"w-full"} disabled={isLoading}>
        {isLoading ? "Creating..." : "Create"}
      </Button>
    </form>
  );
};

export default UserAddForm;

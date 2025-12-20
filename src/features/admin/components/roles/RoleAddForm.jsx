import React from "react";
import { useCreateRoleMutation } from "../../store/roleApi";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RoleAddSchema } from "@/lib/validation/role";
import { useTranslation } from "react-i18next";
import { Spinner } from "@/components/ui/spinner";

const defaultValues = {
  name: "",
};
const RoleAddForm = ({ onFormSubmitSuccess }) => {
  const { t } = useTranslation("rolecontent");
  const [createRole, { isLoading }] = useCreateRoleMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(RoleAddSchema),
    defaultValues: defaultValues,
  });
  const onSubmit = async (data) => {
    try {
      const result = await createRole(data).unwrap();

      if (result.code === 1000) {
        toast.success(t("CreateSuccess"));
        reset();
        onFormSubmitSuccess();
      } else {
        toast.error(result.message || "Create failed");
      }
    } catch (error) {
      const errorMessage = error.data?.message || "Network error";
      toast.error(errorMessage);
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">{t("RoleName")}</FieldLabel>
          <Input
            id="name"
            {...register("name")}
            disabled={isLoading}
            placeholder="ROLE"
          />
          <FieldError>{errors.name?.message}</FieldError>
        </Field>
      </FieldGroup>
      <Button type="submit" className={"w-full"} disabled={isLoading}>
        {isLoading ? (
          <Spinner className={"text-muted-foreground size-4"} />
        ) : (
          t("Create")
        )}
      </Button>
    </form>
  );
};

export default RoleAddForm;

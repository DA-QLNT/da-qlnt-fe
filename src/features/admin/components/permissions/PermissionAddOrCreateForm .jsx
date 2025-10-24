import React, { useMemo } from "react";
import { useCreateOrUpdatePermissionMutation } from "../../store/permissionApi";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PermissionSchema } from "@/lib/validation/permission";
import toast from "react-hot-toast";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Save } from "lucide-react";
import { useTranslation } from "react-i18next";
/**
 * Component Form dùng chung cho Create và Update Permission
 * @param {object | null} initialData - Dữ liệu permission (khi mode='edit')
 */
const PermissionAddOrCreateForm = ({
  initialData = null,
  onFormSubmitSuccess,
}) => {
        const {t} = useTranslation('permissioncontent')
    
  const [createOrUpdatePermission, { isLoading }] =
    useCreateOrUpdatePermissionMutation();
  const isEditMode = !!initialData?.id;
  const defaulValues = useMemo(
    () => ({
      id: initialData?.id || null,
      code: initialData?.code || "",
      description: initialData?.description || "",
    }),
    [initialData]
  );
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(PermissionSchema),
    defaultValues: defaulValues,
  });
  const onSubmit = async (data) => {
    const payload = {
      ...data,
      description: data.description || null,
    };
    try {
      const result = await createOrUpdatePermission(payload).unwrap();
      if (result.code === 1000) {
        const action = isEditMode ? "Update" : "Create";
        toast.success(t(`${action}Success}`))
        if (!isEditMode) reset();
        onFormSubmitSuccess();
      } else {
        toast.error(result.message);

      }
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FieldGroup>
        <Field>
          <FieldLabel>{t("PermissionCode")}</FieldLabel>
          <Input
            id="code"
            {...register("code")}
            placeholder="HOUSE_CREATE"
            disabled={isLoading}
          />
        </Field>
        <FieldError>{errors.code?.message}</FieldError>
        <Field>
          <FieldLabel>{t("Description")}</FieldLabel>
          <Input
            id="description"
            {...register("description")}
            placeholder="House Create"
            disabled={isLoading}
          />
        </Field>
        <FieldError>{errors.description?.message}</FieldError>
      </FieldGroup>
      <Button type="submit" disabled={isLoading} className={"w-full"}>
        {isLoading ? (
          <Spinner />
        ) : (
          <>
            <Save /> {isEditMode ? t("Update") : t("Create")}
          </>
        )}
      </Button>
    </form>
  );
};

export default PermissionAddOrCreateForm;

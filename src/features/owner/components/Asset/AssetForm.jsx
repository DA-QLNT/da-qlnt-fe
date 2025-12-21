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
import { getAssetSchema } from "@/lib/validation/asset";
import { useCreateOrUpdateAssetMutation } from "../../store/assetApi";
import toast from "react-hot-toast";
import { Loader2, Plus, Save } from "lucide-react";
import React, { useMemo } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useTranslation } from "react-i18next";

export default function AssetForm({ initialData = null, onFormSubmitSuccess }) {
  const { t } = useTranslation("asset");
  const [createOrUpdateAsset, { isLoading }] = useCreateOrUpdateAssetMutation();

  const isEditMode = !!initialData?.id;

  const defaultValues = useMemo(
    () => ({
      id: initialData?.id || null,
      name: initialData?.name || "",
    }),
    [initialData]
  );

  const AssetSchema = useMemo(() => getAssetSchema(t), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(AssetSchema),
    defaultValues: defaultValues,
  });

  const onSubmit = async (data) => {
    try {
      const result = await createOrUpdateAsset(data).unwrap();

      if (result.code === 1000) {
        if (isEditMode) {
          toast.success(t("UpdateSuccess", { name: data.name }));
        } else {
          toast.success(t("CreateSuccess", { name: data.name }));
        }

        if (!isEditMode) reset();
        onFormSubmitSuccess();
      } else {
        toast.error(t("OperationFailed"));
      }
    } catch (error) {
      toast.error(error.data?.message || t("NetworkError"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FieldGroup>
        {isEditMode && (
          <input type="hidden" {...register("id", { valueAsNumber: true })} />
        )}

        {/* Name */}
        <Field>
          <FieldLabel htmlFor="name">{t("LabelName")}</FieldLabel>
          <Input
            id="name"
            {...register("name")}
            placeholder={t("PlaceholderName")}
            disabled={isLoading}
          />
          <FieldError>{errors.name?.message}</FieldError>
        </Field>
      </FieldGroup>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <Spinner className={"text-muted-foreground size-4"} />
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />{" "}
            {isEditMode ? t("ButtonUpdate") : t("ButtonCreate")}
          </>
        )}
      </Button>
    </form>
  );
}

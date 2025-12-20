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
import { AssetSchema } from "@/lib/validation/asset";
import { useCreateOrUpdateAssetMutation } from "../../store/assetApi";
import toast from "react-hot-toast";
import { Loader2, Plus, Save } from "lucide-react";
import React, { useMemo } from "react";
import { Spinner } from "@/components/ui/spinner";

export default function AssetForm({ initialData = null, onFormSubmitSuccess }) {
  const [createOrUpdateAsset, { isLoading }] = useCreateOrUpdateAssetMutation();

  const isEditMode = !!initialData?.id;

  const defaultValues = useMemo(
    () => ({
      id: initialData?.id || null,
      name: initialData?.name || "",
    }),
    [initialData]
  );

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
        const action = isEditMode ? "Cập nhật" : "Tạo mới";
        toast.success(`${action} loại tài sản '${data.name}' thành công!`);
        if (!isEditMode) reset();
        onFormSubmitSuccess();
      } else {
        toast.error(result.message || "Thao tác thất bại.");
      }
    } catch (error) {
      toast.error(error.data?.message || "Lỗi mạng hoặc server.");
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
          <FieldLabel htmlFor="name">Tên Loại Tài Sản (*)</FieldLabel>
          <Input
            id="name"
            {...register("name")}
            placeholder="Ví dụ: TIVI, QUẠT, ĐIỀU HÒA"
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
            {isEditMode ? "Cập nhật" : "Tạo mới"}
          </>
        )}
      </Button>
    </form>
  );
}

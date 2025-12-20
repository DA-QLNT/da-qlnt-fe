import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RepairRequestSchema } from "@/lib/validation/repair";
import {
  useCreateRepairRequestMutation,
  useUpdateRepairRequestMutation,
} from "../../store/repairApi";
import {
  Wrench,
  Loader2,
  Save,
  Image as ImageIcon,
  Trash,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

/**
 * Dialog Form cho Tạo (Create) và Sửa (Edit) Yêu cầu Sửa chữa.
 * @param {object} initialData - Dữ liệu yêu cầu sửa chữa (nếu Edit, null nếu Create)
 */
export default function RepairRequestFormDialog({
  initialData,
  open,
  onOpenChange,
}) {
  const { t } = useTranslation("repairreportrule");

  const isEdit = !!initialData;
  const dialogTitle = isEdit ? t("Edit") : t("CreateNew");

  // Hooks API
  const [createRequest, { isLoading: isCreating }] =
    useCreateRepairRequestMutation();
  const [updateRequest, { isLoading: isUpdating }] =
    useUpdateRepairRequestMutation();
  const isLoading = isCreating || isUpdating;

  // Quản lý ảnh preview
  const [previewUrls, setPreviewUrls] = useState([]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(RepairRequestSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      images: undefined, // FileList
      existingImageUrls: initialData?.images || [], // URL ảnh cũ
    },
  });

  const watchedImages = watch("images");
  const existingImageUrls = watch("existingImageUrls");

  // 🚨 HIỆU ỨNG: Xử lý file preview khi chọn file mới
  useEffect(() => {
    if (watchedImages && watchedImages.length > 0) {
      const newUrls = Array.from(watchedImages).map((file) =>
        URL.createObjectURL(file)
      );
      setPreviewUrls(newUrls);
    } else {
      setPreviewUrls([]);
    }
  }, [watchedImages]);

  // 🚨 HIỆU ỨNG: Reset form khi dialog mở/đóng hoặc initialData thay đổi
  useEffect(() => {
    if (open) {
      reset({
        title: initialData?.title || "",
        description: initialData?.description || "",
        images: undefined,
        existingImageUrls: initialData?.images || [],
      });
      setPreviewUrls([]); // Clear preview
    }
  }, [open, initialData, reset]);

  // 🚨 LOGIC XỬ LÝ ẢNH CŨ (XÓA ẢNH CŨ)
  const handleRemoveExistingImage = (url) => {
    const newExistingUrls = existingImageUrls.filter((u) => u !== url);
    setValue("existingImageUrls", newExistingUrls, { shouldDirty: true });
  };

  // 🚨 HÀM XỬ LÝ SUBMIT (FORM DATA)
  const onSubmit = async (data) => {
    const toastId = toast.loading(
      `${isEdit ? t("Updating") : t("Creating")} ...`
    );

    // 1. TẠO FORMDATA
    const formData = new FormData();

    // Thêm trường text
    formData.append("title", data.title);
    if (data.description) formData.append("description", data.description);

    // 2. XỬ LÝ ẢNH MỚI (chỉ gửi file mới nếu có)
    if (data.images && data.images.length > 0) {
      Array.from(data.images).forEach((file) => {
        formData.append("images", file);
      });
    }

    // 3. XỬ LÝ ẢNH CŨ (chỉ gửi danh sách URL còn lại khi Edit)
    if (isEdit && data.existingImageUrls && data.existingImageUrls.length > 0) {
      data.existingImageUrls.forEach((url) => {
        formData.append("existingImageUrls", url);
      });
    }

    try {
      if (isEdit) {
        await updateRequest({ repairId: initialData.id, formData }).unwrap();
      } else {
        await createRequest(formData).unwrap();
      }

      toast.success(`${dialogTitle} ${t("Success")}`, { id: toastId });
      onOpenChange(false);
    } catch (error) {
      toast.error(error.data?.message || `${dialogTitle} ${t("Failed")}.`, {
        id: toastId,
      });
      console.error("Repair mutation error:", error);
    }
  };

  const allImages = [...(existingImageUrls || []), ...previewUrls];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-6 w-6 text-primary" /> {dialogTitle}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? t("EditDetailRepairRequest")
              : t("SendRepairRequestToOwner")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup className="space-y-4">
            <Field>
              <FieldLabel>{t("Title")}*</FieldLabel>
              <Input {...register("title")} disabled={isLoading} />
              <FieldError>{errors.title?.message}</FieldError>
            </Field>

            <Field>
              <FieldLabel>{t("DetailedDescription")}</FieldLabel>
              <Textarea
                {...register("description")}
                disabled={isLoading}
                rows={3}
              />
              <FieldError>{errors.description?.message}</FieldError>
            </Field>

            {/* 🚨 PHẦN XỬ LÝ ẢNH */}
            <Field>
              <FieldLabel className="flex justify-between items-center">
                {t("Image")}
                <span className="text-xs text-muted-foreground">
                  {allImages.length}/5
                </span>
              </FieldLabel>
              <Input
                type="file"
                {...register("images")}
                accept="image/*"
                multiple
                disabled={isLoading || allImages.length >= 5}
              />
              <FieldError>{errors.images?.message}</FieldError>

              {/* HIỂN THỊ PREVIEW VÀ ẢNH CŨ */}
              {allImages.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 p-2 border rounded-md">
                  {/* ẢNH CŨ (CHỈ CÓ KHI EDIT) */}
                  {isEdit &&
                    existingImageUrls?.map((url) => (
                      <div
                        key={url}
                        className="relative w-16 h-16 rounded-md overflow-hidden border"
                      >
                        <img
                          src={url}
                          alt="existing"
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          className="absolute top-0 right-0 h-4 w-4 p-0 rounded-full"
                          onClick={() => handleRemoveExistingImage(url)}
                        >
                          <XCircle className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}

                  {/* ẢNH MỚI UPLOAD */}
                  {previewUrls.map((url, index) => (
                    <div
                      key={index}
                      className="relative w-16 h-16 rounded-md overflow-hidden border"
                    >
                      <img
                        src={url}
                        alt={`preview-${index}`}
                        className="w-full h-full object-cover"
                      />
                      {/* (Không cần nút xóa cho ảnh mới, chỉ cần upload lại hoặc RHF handle) */}
                    </div>
                  ))}
                </div>
              )}
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              type="button"
            >
              {t("Close")}
            </Button>
            <Button type="submit" disabled={isLoading || !isValid}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isEdit ? t("Update") : t("CreateRequest")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

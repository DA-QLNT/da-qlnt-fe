import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateRepairStatusMutation } from "../../store/repairApi";
import {
  Wrench,
  Loader2,
  Info,
  FileText,
  ImageIcon as IconImage,
  CheckCheck,
  DollarSign,
  ImagePlus,
} from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format/dateTimeFormat";
import { formatCurrency } from "@/lib/format/currencyFormat";
import { REPAIR_STATUS_MAP } from "@/assets/repair/repairStatus";
import { Badge } from "@/components/ui/badge";
import { RepairCompletionSchema } from "@/lib/validation/repair";
import { useTranslation } from "react-i18next";

// Component Badge cho Trạng thái
const RepairStatusBadge = ({ status }) => {
  const { t } = useTranslation("repairreportrule");
  const statusInfo = REPAIR_STATUS_MAP[status] || REPAIR_STATUS_MAP[0];
  const { label, color } = statusInfo;
  return <Badge className={`uppercase ${color}`}>{t(`${label}`)}</Badge>;
};

/**
 * Dialog xử lý, hoàn thành yêu cầu sửa chữa của Owner
 * @param {object} request - Dữ liệu yêu cầu sửa chữa
 */
export default function RepairProcessDialog({ request, open, onOpenChange }) {
  const { t } = useTranslation("repairreportrule");

  const repairId = request?.id;
  const isCompleted = request?.status === 3;
  const dialogTitle = isCompleted ? t("Detail") : t("Handle");

  // Hook API
  const [updateRepairStatus, { isLoading: isCompleting }] =
    useUpdateRepairStatusMutation();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid, isDirty },
  } = useForm({
    resolver: zodResolver(RepairCompletionSchema),
    defaultValues: {
      note: request?.note || "",
      cost: request?.cost || 0,
      completedImages: null,
    },
  });

  // Watch file input for preview
  const evidenceFiles = watch("completedImages");
  const [evidencePreviews, setEvidencePreviews] = useState([]);

  useEffect(() => {
    if (evidenceFiles && evidenceFiles.length > 0) {
      const urls = Array.from(evidenceFiles).map((file) =>
        URL.createObjectURL(file)
      );
      setEvidencePreviews(urls);
      // Cleanup
      return () => urls.forEach((url) => URL.revokeObjectURL(url));
    } else {
      setEvidencePreviews([]);
    }
  }, [evidenceFiles]);

  // Reset form khi request thay đổi
  useEffect(() => {
    if (request) {
      reset({
        note: request.note || "",
        cost: request.cost || 0,
        completedImages: null,
      });
      setEvidencePreviews([]);
    }
  }, [request, reset]);

  // 🚨 HÀM XỬ LÝ HOÀN THÀNH
  const onSubmit = async (data) => {
    const toastId = toast.loading(`${t("ConfirmComplete")}...`);

    // Dữ liệu đã bao gồm note và cost, status=2 được thêm trong mutation
    const payload = {
      note: data.note,
      cost: data.cost,
      completedImages: data.completedImages,
    };

    try {
      await updateRepairStatus({
        repairId,
        status: 3,
        ...payload,
      }).unwrap();
      toast.success(t("Completed"), { id: toastId });
      onOpenChange(false);
    } catch (error) {
      toast.error(t("Failed"), {
        id: toastId,
      });
      console.error("Complete repair error:", error);
    }
  };

  if (!request) return null;

  const formattedCompletedDate = request.completedDate
    ? formatDateTime(request.completedDate).formattedDate
    : "-";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-6 w-6 text-primary" /> {dialogTitle}
          </DialogTitle>
          <DialogDescription className="text-lg font-medium pt-1">
            {request.title} - {t("Room")}: {request.roomName}
          </DialogDescription>
        </DialogHeader>

        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> */}
        <div
          className={cn(
            "grid grid-cols-1 gap-4",
            request.status === 2 ? "grid-cols-2" : ""
          )}
        >
          {/* CỘT TRÁI: THÔNG TIN VÀ MÔ TẢ */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-5 w-5" /> {t("BaseInfor")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">{t("Tenant")}:</span>{" "}
                    {request.tenantName}
                  </div>
                  <div>
                    <span className="font-medium">{t("Room")}:</span>{" "}
                    {request.roomName} - ({request.houseName})
                  </div>
                  <div>
                    <span className="font-medium">{t("Status")}:</span>{" "}
                    <RepairStatusBadge status={request.status} />
                  </div>
                  <div>
                    <span className="font-medium">{t("CompletedDate")}:</span>{" "}
                    {formattedCompletedDate}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" /> {t("Description")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {request.description || t("NoDescription")}
                </p>
              </CardContent>
            </Card>

            {/* HÌNH ẢNH YÊU CẦU (CỦA KHÁCH) */}
            {request.images && request.images.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <IconImage className="h-5 w-5" /> {t("Image")} ({t("Tenant")})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                    {request.images.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`Image ${index + 1}`}
                        className="w-20 h-20 object-cover border rounded-md"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* KẾT QUẢ SỬA CHỮA (HIỂN THỊ KHI ĐÃ HOÀN THÀNH) */}
            {request.status === 3 && (
              <Card className="border-green-200 bg-green-50/30">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-green-700">
                    <CheckCheck className="h-5 w-5" /> {t("Detail")}{" "}
                    {t("Completed")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium flex items-center gap-1 text-muted-foreground mb-1">
                        <DollarSign className="w-4 h-4" /> {t("RepairCost")}
                      </span>
                      <span className="text-lg font-semibold text-green-700">
                        {formatCurrency(request.cost)}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium flex items-center gap-1 text-muted-foreground mb-1">
                        <FileText className="w-4 h-4" /> {t("NoteOwner")}
                      </span>
                      <p className="text-sm">
                        {request.note || t("NoDescription")}
                      </p>
                    </div>
                  </div>

                  {/* Ảnh minh chứng hoàn thành */}
                  {request.completedImages &&
                    request.completedImages.length > 0 && (
                      <div>
                        <span className="font-medium flex items-center gap-1 text-muted-foreground mb-2">
                          <IconImage className="w-4 h-4" /> {t("Image")} (
                          {t("Completed")})
                        </span>
                        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                          {request.completedImages.map((url, index) => (
                            <img
                              key={index}
                              src={url}
                              alt={`Evidence ${index + 1}`}
                              className="w-20 h-20 object-cover border rounded-md"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* CỘT PHẢI: FORM XỬ LÝ (CHỈ HIỂN THỊ KHI STATUS LÀ 2) */}
          {request.status === 2 && (
            <div className="space-y-4">
              <Card className="p-0 border-0 shadow-none">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCheck className="h-5 w-5 text-green-600" />{" "}
                    {t("UpdateStatus")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <FieldGroup className="space-y-4">
                      <Field>
                        <FieldLabel>{t("RepairCost")}*</FieldLabel>
                        <Input
                          type="number"
                          {...register("cost", { valueAsNumber: true })}
                          disabled={isCompleting}
                        />
                        <FieldError>{errors.cost?.message}</FieldError>
                      </Field>

                      <Field>
                        <FieldLabel>{t("Note")}</FieldLabel>
                        <Textarea
                          {...register("note")}
                          disabled={isCompleting}
                          rows={4}
                        />
                        <FieldError>{errors.note?.message}</FieldError>
                      </Field>

                      <Field>
                        <FieldLabel className="flex items-center gap-2">
                          <ImagePlus className="w-4 h-4" />
                          {t("Image")} ({t("Optional")})
                        </FieldLabel>

                        {/* Preview Images */}
                        {evidencePreviews.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {evidencePreviews.map((src, idx) => (
                              <div
                                key={idx}
                                className="relative w-16 h-16 border rounded-md overflow-hidden group"
                              >
                                <img
                                  src={src}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        <Input
                          type="file"
                          accept="image/*"
                          multiple
                          {...register("completedImages")}
                          disabled={isCompleting}
                          className="cursor-pointer"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {t("Max5Images")}
                        </p>
                        <FieldError>
                          {/* {errors.completedImages?.message ||
                            errors.completedImages?.root?.message} */}
                          {t(errors.completedImages?.message)}
                        </FieldError>
                      </Field>
                    </FieldGroup>

                    <div className="flex justify-end pt-2">
                      <Button
                        type="submit"
                        disabled={isCompleting}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isCompleting ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <CheckCheck className="h-4 w-4 mr-2" />
                        )}
                        {t("ConfirmComplete")}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={isCompleting}
          >
            {t("Close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

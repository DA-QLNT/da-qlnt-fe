import React, { useEffect } from "react";
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
import { useCompleteRepairRequestMutation } from "../../store/repairApi";
import {
  Wrench,
  Loader2,
  Info,
  FileText,
  ImageIcon as IconImage,
  CheckCheck,
  DollarSign,
} from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format/dateTimeFormat";
import { formatCurrency } from "@/lib/format/currencyFormat";
import { REPAIR_STATUS_MAP } from "@/assets/repair/repairStatus";
import { Badge } from "@/components/ui/badge";
import { RepairCompletionSchema } from "@/lib/validation/repair";

// Component Badge cho Trạng thái
const RepairStatusBadge = ({ status }) => {
  const statusInfo = REPAIR_STATUS_MAP[status] || REPAIR_STATUS_MAP[0];
  const { label, color } = statusInfo;
  return <Badge className={`uppercase ${color}`}>{label}</Badge>;
};

/**
 * Dialog xử lý, hoàn thành yêu cầu sửa chữa của Owner
 * @param {object} request - Dữ liệu yêu cầu sửa chữa
 */
export default function RepairProcessDialog({ request, open, onOpenChange }) {
  const repairId = request?.id;
  const isCompleted = request?.status === 2;
  const dialogTitle = isCompleted ? `Chi tiết Yêu cầu` : `Xử lý Yêu cầu`;

  // Hook API
  const [completeRequest, { isLoading: isCompleting }] =
    useCompleteRepairRequestMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm({
    resolver: zodResolver(RepairCompletionSchema),
    defaultValues: {
      note: request?.note || "",
      cost: request?.cost || 0,
    },
  });

  // Reset form khi request thay đổi
  useEffect(() => {
    if (request) {
      reset({
        note: request.note || "",
        cost: request.cost || 0,
      });
    }
  }, [request, reset]);

  // 🚨 HÀM XỬ LÝ HOÀN THÀNH
  const onSubmit = async (data) => {
    const toastId = toast.loading(
      `Đang xác nhận hoàn thành yêu cầu ${repairId}...`
    );

    // Dữ liệu đã bao gồm note và cost, status=2 được thêm trong mutation
    const payload = {
      note: data.note,
      cost: data.cost,
    };

    try {
      await completeRequest({ repairId, data: payload }).unwrap();
      toast.success(`Đã hoàn thành yêu cầu ${repairId}.`, { id: toastId });
      onOpenChange(false);
    } catch (error) {
      toast.error(error.data?.message || "Xác nhận hoàn thành thất bại.", {
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
            {request.title} - Phòng: {request.roomName}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* CỘT TRÁI: THÔNG TIN VÀ MÔ TẢ */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-5 w-5" /> Thông tin cơ bản
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Người gửi:</span>{" "}
                    {request.tenantName}
                  </div>
                  <div>
                    <span className="font-medium">Phòng:</span>{" "}
                    {request.roomName} ({request.houseName})
                  </div>
                  <div>
                    <span className="font-medium">Trạng thái:</span>{" "}
                    <RepairStatusBadge status={request.status} />
                  </div>
                  <div>
                    <span className="font-medium">Ngày hoàn thành:</span>{" "}
                    {formattedCompletedDate}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" /> Mô tả
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {request.description || "Không có mô tả chi tiết."}
                </p>
              </CardContent>
            </Card>

            {/* HÌNH ẢNH */}
            {request.images && request.images.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <IconImage className="h-5 w-5" /> Hình ảnh (
                    {request.images.length})
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
          </div>

          {/* CỘT PHẢI: FORM XỬ LÝ (CHỈ KHI CHƯA HOÀN THÀNH) */}
          <div className="space-y-4">
            <Card className="p-0 border-0 shadow-none">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCheck className="h-5 w-5 text-green-600" /> Cập nhật
                  Trạng thái
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <FieldGroup className="space-y-4">
                    <Field>
                      <FieldLabel>Chi phí sửa chữa (*)</FieldLabel>
                      <Input
                        type="number"
                        {...register("cost", { valueAsNumber: true })}
                        disabled={isCompleted || isCompleting}
                      />
                      <FieldError>{errors.cost?.message}</FieldError>
                    </Field>

                    <Field>
                      <FieldLabel>Ghi chú cho Tenant</FieldLabel>
                      <Textarea
                        {...register("note")}
                        disabled={isCompleted || isCompleting}
                        rows={4}
                      />
                      <FieldError>{errors.note?.message}</FieldError>
                    </Field>

                    {isCompleted && (
                      <p className="text-sm font-medium text-green-600">
                        Yêu cầu này đã được hoàn thành.
                      </p>
                    )}
                  </FieldGroup>

                  {!isCompleted && (
                    <div className="flex justify-end pt-2">
                      <Button
                        type="submit"
                        disabled={isCompleting || !isValid}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isCompleting ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <CheckCheck className="h-4 w-4 mr-2" />
                        )}
                        Xác nhận Hoàn thành
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={isCompleting}
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

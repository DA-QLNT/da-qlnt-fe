import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Wrench,
  Info,
  DollarSign,
  Calendar as CalendarIcon,
  XCircle,
  ImageIcon as IconImage,
  FileText,
  Loader2,
  Send,
  CheckCheck,
} from "lucide-react";
import { formatDateTime } from "@/lib/format/dateTimeFormat";
import { formatCurrency } from "@/lib/format/currencyFormat";
import { REPAIR_STATUS_MAP } from "@/assets/repair/repairStatus"; // Giả định import
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSubmitRepairRequestMutation } from "../../store/repairApi";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

// Component Badge cho Trạng thái
const RepairStatusBadge = ({ status }) => {
  const { t } = useTranslation("repairreportrule");

  const statusInfo = REPAIR_STATUS_MAP[status] || REPAIR_STATUS_MAP[0];
  const { label, color } = statusInfo;
  return <Badge className={`uppercase ${color}`}>{t(`${label}`)}</Badge>;
};

export default function RepairRequestDetailDialog({
  request,
  open,
  onOpenChange,
}) {
  const { t } = useTranslation("repairreportrule");

  // Always initialize hooks at the top level to preserve hook order
  const [submitRequest, { isLoading: isSubmitting }] =
    useSubmitRepairRequestMutation();

  if (!request) return null;

  // 🚨 HÀM XỬ LÝ GỬI YÊU CẦU
  const handleSubmitRequest = async () => {
    const repairId = request.id;
    const toastId = toast.loading(t("SendingRequest"));

    try {
      await submitRequest(repairId).unwrap();
      toast.success(t("SendingSuccess"), {
        id: toastId,
      });
      onOpenChange(false);
    } catch (error) {
      toast.error(t("SendingFailed"), {
        id: toastId,
      });
      console.error("Submit repair error:", error);
    }
  };

  const formattedDate = request.completedDate
    ? formatDateTime(request.completedDate).formattedDate
    : "-";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-6 w-6 text-primary" /> {t("DetailRequest")}
          </DialogTitle>
          <DialogDescription className="text-lg font-medium pt-1">
            {request.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* THÔNG TIN CƠ BẢN */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-5 w-5" /> {t("Infor")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">{t("Room")}:</span>{" "}
                  {request.roomName} ({request.houseName})
                </div>
                <div>
                  <span className="font-medium">{t("Status")}:</span>{" "}
                  <RepairStatusBadge status={request.status} />
                </div>
                {/* <div>
                  <span className="font-medium">{t("Cost")}:</span>{" "}
                  {request.cost ? formatCurrency(request.cost) : ""}
                </div> */}
                <div>
                  <span className="font-medium">{t("CompletedDate")}:</span>{" "}
                  {formattedDate}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* MÔ TẢ */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" /> {t("DetailedDescription")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {request.description || t("NoDetailedDescription")}
              </p>
              {request.note && request.status !== 3 && (
                <div className="mt-3 p-3 bg-secondary rounded-md">
                  <span className="font-medium text-xs block">
                    {t("NoteOwner")}:
                  </span>
                  <p className="text-sm">{request.note}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* HÌNH ẢNH */}
          {request.images && request.images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <IconImage className="h-5 w-5" /> {t("Image")} (
                  {request.images.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {request.images.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Repair Image ${index + 1}`}
                      className="w-24 h-24 object-cover border rounded-md shadow-sm cursor-pointer hover:shadow-lg transition-shadow"
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

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {t("Close")}
          </Button>
          {request.status === 0 && (
            <Button onClick={handleSubmitRequest} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              {t("SendToOwner")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

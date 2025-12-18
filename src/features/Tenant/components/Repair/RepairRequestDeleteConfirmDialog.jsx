import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteRepairRequestMutation } from "../../store/repairApi";
import { Trash, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import React from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

/**
 * Dialog xác nhận xóa yêu cầu sửa chữa (chỉ khi status = 0)
 */
export default function RepairRequestDeleteConfirmDialog({
  repairId,
  open,
  onOpenChange,
}) {
  const { t } = useTranslation("repairreportrule");

  const [deleteRequest, { isLoading }] = useDeleteRepairRequestMutation();

  const handleDelete = async () => {
    if (!repairId) return;

    const toastId = toast.loading(`${t("Delete")}...`);
    try {
      await deleteRequest(repairId).unwrap();

      toast.success(t("DeleteSuccess"), {
        id: toastId,
        duration: 3000,
      });
      onOpenChange(false); // Đóng dialog
    } catch (error) {
      toast.error(t("DeleteFailed"), {
        id: toastId,
      });
      console.error("Lỗi xóa yêu cầu:", error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <Trash className="w-6 h-6" />
            {t("Confirm")} {t("Delete")}
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {t("Cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("Delete")}
                ...
              </>
            ) : (
              t("Delete")
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

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

/**
 * Dialog xác nhận xóa yêu cầu sửa chữa (chỉ khi status = 0)
 */
export default function RepairRequestDeleteConfirmDialog({
  repairId,
  open,
  onOpenChange,
}) {
  const [deleteRequest, { isLoading }] = useDeleteRepairRequestMutation();

  const handleDelete = async () => {
    if (!repairId) return;

    const toastId = toast.loading(`Đang xóa yêu cầu sửa chữa...`);
    try {
      await deleteRequest(repairId).unwrap();

      toast.success(`Yêu cầu đã được xóa thành công.`, {
        id: toastId,
        duration: 3000,
      });
      onOpenChange(false); // Đóng dialog
    } catch (error) {
      toast.error(error.data?.message || "Xóa yêu cầu thất bại.", {
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
            Xác nhận Xóa Yêu cầu
          </AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn XÓA yêu cầu sửa chữa này không?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xóa...
              </>
            ) : (
              "Đồng ý Xóa bỏ"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

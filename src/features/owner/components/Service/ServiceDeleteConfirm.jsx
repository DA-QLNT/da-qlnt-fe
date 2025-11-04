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
import { useDeleteServiceMutation } from "../../store/serviceApi";
import { Trash, AlertTriangle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import React from "react";
import { Spinner } from "@/components/ui/spinner";

// Component nhận serviceId, serviceName và các props điều khiển Dialog
export default function ServiceDeleteConfirm({
  serviceId,
  serviceName,
  open,
  onOpenChange,
}) {
  const [deleteService, { isLoading }] = useDeleteServiceMutation();

  const handleDelete = async () => {
    try {
      await deleteService(serviceId).unwrap();

      toast.success(`Đã xóa thành công.`);
      onOpenChange(false); 
    } catch (error) {
      toast.error(`Xóa thất bại.`);
      console.error("Lỗi xóa Service:", error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-6 h-6" />
            Xác nhận xóa Dịch vụ
          </AlertDialogTitle>
          <AlertDialogDescription>
            Anh có chắc chắn muốn xóa vĩnh viễn dịch vụ {serviceName} không?
            Thao tác này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Hủy bỏ</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? (
              <Spinner/>
            ) : (
              "Đồng ý xóa"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

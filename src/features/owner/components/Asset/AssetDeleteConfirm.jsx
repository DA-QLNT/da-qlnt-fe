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
import { useDeleteAssetMutation } from "../../store/assetApi";
import { Trash, AlertTriangle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import React from "react";
import { Spinner } from "@/components/ui/spinner";

export default function AssetDeleteConfirm({
  assetId,
  assetName,
  open,
  onOpenChange,
}) {
  const [deleteAsset, { isLoading }] = useDeleteAssetMutation();

  const handleDelete = async () => {
    try {
      await deleteAsset(assetId).unwrap();

      toast.success(`Đã xóa loại tài sản '${assetName}' thành công.`);
      onOpenChange(false);
    } catch (error) {
      console.error("Lỗi xóa Asset:", error);
      const errorMessage =
        error.data?.message || `Xóa loại tài sản '${assetName}' thất bại.`;
      toast.error(errorMessage);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-6 h-6" />
            Xác nhận xóa Loại Tài Sản
          </AlertDialogTitle>
          <AlertDialogDescription>
            Anh có chắc chắn muốn xóa loại tài sản {assetName} không? Thao
            tác này sẽ xóa tất cả Asset Items thuộc loại này khỏi hệ thống.
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

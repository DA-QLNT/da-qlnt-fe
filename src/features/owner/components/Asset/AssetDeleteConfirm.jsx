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
import { useTranslation } from "react-i18next";

export default function AssetDeleteConfirm({
  assetId,
  assetName,
  open,
  onOpenChange,
}) {
  const { t } = useTranslation("asset");
  const [deleteAsset, { isLoading }] = useDeleteAssetMutation();

  const handleDelete = async () => {
    try {
      await deleteAsset(assetId).unwrap();

      toast.success(t("DeleteSuccess", { name: assetName }));
      onOpenChange(false);
    } catch (error) {
      console.error("Lỗi xóa Asset:", error);

      toast.error(t("DeleteFailed"));
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-6 h-6" />
            {t("ConfirmDeleteTitle")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("ConfirmDeleteMessage", { name: assetName })}
          </AlertDialogDescription>
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
            {isLoading ? <Spinner /> : t("ConfirmDelete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

import React from "react";
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
import { useDeletePermissionMutation } from "../../store/permissionApi";
import toast from "react-hot-toast";
import { Spinner } from "@/components/ui/spinner";
import { useTranslation } from "react-i18next";
const PermissionDeleteConfirm = ({
  permissionId,
  permissionCode,
  open,
  onOpenChange,
}) => {
      const {t} = useTranslation('permissioncontent')
  
  const [deletePermission, { isLoading }] = useDeletePermissionMutation();
  const handleDelete = async () => {
    try {
      await deletePermission(permissionId).unwrap();
      toast.success(t('DeleteSuccess'));
      onOpenChange(false);
    } catch (error) {
      console.error("error delete", error);
      toast.error(`Failed to delete permission ${permissionCode}`);
    }
  };
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('ConfirmDelete')} {permissionCode}</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{t('Cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-500 hover:bg-red-800"
          >
            {isLoading ? <Spinner /> : t('Delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PermissionDeleteConfirm;

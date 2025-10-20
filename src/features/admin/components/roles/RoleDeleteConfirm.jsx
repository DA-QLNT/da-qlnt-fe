import React from "react";
import { useDeleteRoleMutation } from "../../store/roleApi";
import toast from "react-hot-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import { useTranslation } from "react-i18next";

const RoleDeleteConfirm = ({ roleId, roleName, open, onOpenChange }) => {
  const { t } = useTranslation("rolecontent");
  const [deleteRole, { isLoading }] = useDeleteRoleMutation();
  const handleDelete = async () => {
    try {
      await deleteRole(roleId).unwrap();
      toast.success(t('DeleteSuccess'));
      onOpenChange(false);
    } catch (error) {
      console.error("Error delete role", error);
      const errorMessage = `Failed to delete role ${roleName}`;
      toast.error(errorMessage);
    }
  };
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('ConfirmDelete')} {roleName}</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{t('Cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-500 hover:bg-red-700"
          >
            {isLoading ? <Spinner /> : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
export default RoleDeleteConfirm;

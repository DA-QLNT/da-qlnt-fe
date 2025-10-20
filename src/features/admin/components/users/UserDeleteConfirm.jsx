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
import { useDeleteUserMutation } from "../../store/userApi";
import toast from "react-hot-toast";
import { Spinner } from "@/components/ui/spinner";
import { useTranslation } from "react-i18next";

const UserDeleteConfirm = ({ userId, username, open, onOpenChange }) => {
  const { t } = useTranslation("usercontent");
  const [deleteUser, { isLoading }] = useDeleteUserMutation();
  const handleDelete = async () => {
    try {
      await deleteUser(userId).unwrap();
      toast.success(`${t("DeleteSuccess")}`);
      onOpenChange(false);
    } catch (error) {
      console.error("Error delete user", error);
      const errorMessage = `Failed to delete user ${username}`;
      toast.error(errorMessage);
    }
  };
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("ConfirmDeleteUser")} {username}
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {t("Cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-500 hover:bg-red-700"
          >
            {isLoading ? (
              <div>
                <Spinner className="size-1" />
              </div>
            ) : (
              <div>{t("Delete")}</div>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default UserDeleteConfirm;

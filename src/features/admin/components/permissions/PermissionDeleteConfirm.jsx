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
const PermissionDeleteConfirm = ({
  permissionId,
  permissionCode,
  open,
  onOpenChange,
}) => {
  const [deletePermission, { isLoading }] = useDeletePermissionMutation();
  const handleDelete = async () => {
    try {
      await deletePermission(permissionId).unwrap();
      toast.success("Delete success");
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
          <AlertDialogTitle>Confirm Delete {permissionCode}</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-500 hover:bg-red-800"
          >
            {isLoading ? <Spinner /> : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PermissionDeleteConfirm;

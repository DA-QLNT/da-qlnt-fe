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

const UserDeleteConfirm = ({ userId, username, open, onOpenChange }) => {
  const [deleteUser, { isLoading }] = useDeleteUserMutation();
  const handleDelete = async () => {
    try {
      await deleteUser(userId).unwrap();
      toast.success(`Delete user ${username} successfully`);
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
          <AlertDialogTitle>Confirm delete user {username}</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-500 hover:bg-red-700"
          >
            {isLoading ? (
              <div>
                <Spinner className="size-1" /> Deleting...
              </div>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default UserDeleteConfirm;

import React from "react";
import toast from "react-hot-toast";
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
import { useDeleteRoomMutation } from "../../store/roomApi";
import { useTranslation } from "react-i18next";
import { Spinner } from "@/components/ui/spinner";
import { useNavigate } from "react-router-dom";
const RoomDeleteConfirm = ({ roomId, open, onOpenChange }) => {
  const { t } = useTranslation("house");
  const navigate = useNavigate();
  const [deleteRoom, { isLoading }] = useDeleteRoomMutation();
  const handleDelete = async () => {
    try {
      await deleteRoom(roomId).unwrap();
      toast.success(t("DeleteSuccess"));
      navigate(-1);
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error(t("DeleteFail"));
    }
  };
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("DeleteRoomConfirm")}</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {t("Cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className={"bg-destructive"}
          >
            {isLoading ? <Spinner /> : t("AgreeDelete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RoomDeleteConfirm;

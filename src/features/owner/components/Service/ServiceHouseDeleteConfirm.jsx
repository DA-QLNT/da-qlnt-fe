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

import toast from "react-hot-toast";
import { useDeleteHouseServiceMutation } from "../../store/serviceApi";
import { Spinner } from "@/components/ui/spinner";
import { useTranslation } from "react-i18next";

const ServiceHouseDeleteConfirm = ({
  open,
  onOpenChange,
  houseServiceId,
  serviceName,
}) => {
  const { t } = useTranslation("service");
  const [deleteHouseService, { isLoading: isDeleting }] =
    useDeleteHouseServiceMutation();

  const handleDelete = async () => {
    try {
      await deleteHouseService(houseServiceId).unwrap();
      toast.success(t("DeleteSuccess"));
      onOpenChange(false);
    } catch (error) {
      toast.error(t("DeleteFail"));
      console.error("Error house-service:", error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("DeleteConfirm")}</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {t("Cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className={"text-white bg-destructive"}
          >
            {isDeleting ? <Spinner /> : `${t("Delete")}`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ServiceHouseDeleteConfirm;

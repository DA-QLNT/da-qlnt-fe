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

const ServiceHouseDeleteConfirm = ({
  open,
  onOpenChange,
  houseServiceId,
  serviceName,
}) => {
  const [deleteHouseService, { isLoading: isDeleting }] =
    useDeleteHouseServiceMutation();

  const handleDelete = async () => {
    try {
      await deleteHouseService(houseServiceId).unwrap();
      toast.success(`Đã xóa dịch vụ "${serviceName}" khỏi nhà.`);
      onOpenChange(false);
    } catch (error) {
      toast.error("Lỗi khi xóa dịch vụ nhà.");
      console.error("Lỗi xóa house-service:", error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa dịch vụ nhà</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa dịch vụ{" "}
            <span className="font-semibold text-destructive">
              "{serviceName}"
            </span>{" "}
            khỏi nhà này không? Thao tác này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className={"text-white bg-destructive"}
          >
            {isDeleting ? <Spinner /> : "Xóa"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ServiceHouseDeleteConfirm;

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

import { CheckCheck, XCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  useConfirmTenantContractMutation,
  useRejectTenantContractMutation,
} from "../store/contractApi";

/**
 * Dialog xác nhận hành động (Confirm/Reject) của Tenant
 */
export default function ContractTenantConfirmDialog({
  contract,
  actionType,
  open,
  onOpenChange,
}) {
  const isConfirm = actionType === "confirm";
  const contractId = contract?.id;
  const actionLabel = isConfirm ? "Xác nhận" : "Từ chối";

  const [confirmContract, { isLoading: confirming }] =
    useConfirmTenantContractMutation();
  const [rejectContract, { isLoading: rejecting }] =
    useRejectTenantContractMutation();
  const isLoading = confirming || rejecting;

  const handleAction = async () => {
    const mutationFn = isConfirm ? confirmContract : rejectContract;
    const toastId = toast.loading(`Đang xử lý ${actionLabel} hợp đồng...`);

    try {
      await mutationFn(contractId).unwrap();
      toast.success(`${actionLabel} thành công!`, { id: toastId });
      onOpenChange(false);
    } catch (error) {
      toast.error(error.data?.message || `${actionLabel} thất bại.`, {
        id: toastId,
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle
            className={`flex items-center gap-2 ${
              isConfirm ? "text-green-600" : "text-red-600"
            }`}
          >
            {isConfirm ? (
              <CheckCheck className="w-6 h-6" />
            ) : (
              <XCircle className="w-6 h-6" />
            )}
            {actionLabel} Hợp đồng #{contractId}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isConfirm
              ? "Anh có chắc chắn muốn xác nhận và đồng ý với các điều khoản của hợp đồng này không?"
              : "Việc từ chối hợp đồng này sẽ chuyển trạng thái về CANCELLED. Anh có chắc muốn tiếp tục?"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Hủy bỏ</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleAction}
            disabled={isLoading}
            variant={isConfirm ? "default" : "destructive"}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              `Đồng ý ${actionLabel}`
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

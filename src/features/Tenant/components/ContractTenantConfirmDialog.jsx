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
import { CheckCheck, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import React from "react";
import { Button } from "@/components/ui/button";
import { useConfirmTenantContractMutation } from "../store/contractApi";
import { useTranslation } from "react-i18next";

/**
 * Dialog xác nhận hành động (Confirm) của Tenant
 */
export default function ContractTenantConfirmDialog({
  contract,
  open,
  onOpenChange,
}) {
  const { t } = useTranslation("repairreportrule");

  const [confirmContract, { isLoading }] = useConfirmTenantContractMutation();
  const contractId = contract?.id;

  const handleAction = async () => {
    const toastId = toast.loading(`Đang xử lý xác nhận hợp đồng...`);

    try {
      await confirmContract(contractId).unwrap(); // Gửi contractId
      toast.success("Xác nhận thành công!", { id: toastId });
      onOpenChange(false);
    } catch (error) {
      toast.error(error.data?.message || "Xác nhận thất bại.", { id: toastId });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle
            className={`flex items-center gap-2 text-green-600`}
          >
            <CheckCheck className="w-6 h-6" />
            Xác nhận Hợp đồng {contractId}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Anh có chắc chắn muốn xác nhận và đồng ý với các điều khoản của hợp
            đồng này không?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Hủy bỏ</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleAction}
            disabled={isLoading}
            variant={"default"}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              `Đồng ý Xác nhận`
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

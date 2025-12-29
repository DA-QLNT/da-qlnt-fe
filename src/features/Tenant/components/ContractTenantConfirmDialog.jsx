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
  const { t } = useTranslation("contractinvoice");

  const [confirmContract, { isLoading }] = useConfirmTenantContractMutation();
  const contractId = contract?.id;

  const handleAction = async () => {
    const toastId = toast.loading(t("ProcessingConfirmation"));

    try {
      await confirmContract(contractId).unwrap(); // Gửi contractId
      toast.success(t("ConfirmationSuccess"), { id: toastId });
      onOpenChange(false);
    } catch (error) {
      toast.error(error.data?.message || t("ConfirmationFailed"), {
        id: toastId,
      });
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
            {t("ConfirmContractTitle")} {contractId}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("ConfirmContractQuestion")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {t("Disagree")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleAction}
            disabled={isLoading}
            variant={"default"}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              t("AgreeConfirm")
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

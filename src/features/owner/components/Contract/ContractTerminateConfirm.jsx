import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTerminateContractMutation } from "../../store/contractApi";
import { Play, AlertTriangle, Loader2, OctagonX } from "lucide-react";
import toast from "react-hot-toast";
import React from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

/**
 * Dialog xác nhận kích hoạt hợp đồng (DRAFT -> PENDING/ACTIVE)
 * @param {object} contract - Dữ liệu hợp đồng
 */
export default function ContractTerminateConfirm({
  contract,
  open,
  onOpenChange,
}) {
  const { t } = useTranslation("contractinvoice");
  const [terminateContract, { isLoading }] = useTerminateContractMutation();

  const contractId = contract?.id;
  const startDate = contract?.startDate
    ? format(new Date(contract.startDate), "dd/MM/yyyy")
    : "N/A";
  const isPending = contract && new Date(contract.startDate) > new Date();

  const handleTerminate = async () => {
    try {
      await terminateContract(contractId).unwrap();

      toast.success(t("TerminateSuccess"));
      onOpenChange(false);
    } catch (error) {
      toast.error(t("TerminateFailed"));
      console.error("Lỗi thanh lý:", error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader className="text-red-600">
          <AlertDialogTitle className="flex items-center gap-2 ">
            <OctagonX />
            {t("ConfirmTerminateContract")}
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {t("Disabled")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleTerminate}
            disabled={isLoading}
            className="bg-red-500"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              </>
            ) : (
              t("ConfirmTerminate")
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

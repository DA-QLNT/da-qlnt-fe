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
import { useActivateContractMutation } from "../../store/contractApi";
import { Play, AlertTriangle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import React from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

/**
 * Dialog xác nhận kích hoạt hợp đồng (DRAFT -> PENDING/ACTIVE)
 * @param {object} contract - Dữ liệu hợp đồng
 */
export default function ContractActivateConfirm({
  contract,
  open,
  onOpenChange,
}) {
  const { t } = useTranslation("contractinvoice");
  const [activateContract, { isLoading }] = useActivateContractMutation();

  const contractId = contract?.id;
  const startDate = contract?.startDate
    ? format(new Date(contract.startDate), "dd/MM/yyyy")
    : "N/A";
  const isPending = contract && new Date(contract.startDate) > new Date();

  const handleActivate = async () => {
    const toastId = toast.loading(
      `${t("ActivatingContractLoading")} ${contractId}...`
    );
    try {
      await activateContract(contractId).unwrap();

      toast.success(
        `${t("ActivatedSuccess")}! ${t("ContractCode")} đang ở trạng thái ${
          isPending ? t("Pending") : t("Active")
        }`,
        { id: toastId, duration: 5000 }
      );
      onOpenChange(false);
    } catch (error) {
      toast.error(error.data?.message || t("PleaseCheckContractData"), {
        id: toastId,
      });
      console.error("Lỗi kích hoạt:", error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 ">
            <Play className="w-6 h-6" />
            {t("ConfirmActivateContract")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("ActiveContractMessage").replace(
              "hợp đồng này",
              `${t("ContractCode")} ${contractId}`
            )}
            {isPending ? (
              <span className="mt-2 block text-yellow-600 font-medium">
                {t("ContractWillPending")} {startDate}.
              </span>
            ) : (
              <span className="mt-2 block text-yellow-600 font-medium">
                {t("ContractWillActive")}
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {t("DisabledButton")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleActivate}
            disabled={isLoading}
            className="bg-green-400 hover:bg-green-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                {t("ActivatingContractLoading")}...
              </>
            ) : (
              t("ConfirmActivate")
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

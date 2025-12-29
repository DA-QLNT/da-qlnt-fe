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
import { useSendContractEmailMutation } from "../../store/contractApi"; //  Import hook
import { Mail, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import React from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

/**
 * Dialog xác nhận gửi email hợp đồng cho khách thuê.
 * @param {object} contract - Dữ liệu hợp đồng
 */
export default function ContractSendEmailConfirm({
  contract,
  open,
  onOpenChange,
}) {
  const { t } = useTranslation("contractinvoice");
  const [sendEmail, { isLoading }] = useSendContractEmailMutation();

  const contractId = contract?.id;

  const handleSend = async () => {
    const toastId = toast.loading(
      `${t("SendingContract")} ${contractId} ${t("ViaEmail")}...`
    );
    try {
      await sendEmail(contractId).unwrap();

      toast.success(
        `${t("ContractCode")} ${contractId} ${t("SentEmailSuccessToTenant")}!`,
        { id: toastId, duration: 5000 }
      );
      onOpenChange(false); // Đóng dialog
    } catch (error) {
      toast.error(error.data?.message || t("EmailSendFailed"), {
        id: toastId,
      });
      console.error("Lỗi gửi email:", error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-primary">
            <Mail className="w-6 h-6" />
            {t("ConfirmSendEmailContract")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("SendEmailMessage")} {t("SendToPDF")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {t("Cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSend}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                {t("SendingEmail")}
              </>
            ) : (
              t("ConfirmSendEmail")
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

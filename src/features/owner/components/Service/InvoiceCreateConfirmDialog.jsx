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
import { useCreateInvoiceMutation } from "../../store/serviceApi";
import { FileText, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import React from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default function InvoiceCreateConfirmDialog({
  roomId,
  open,
  onOpenChange,
}) {
  const { t } = useTranslation("service");
  const [createInvoice, { isLoading }] = useCreateInvoiceMutation();
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const handleCreate = async () => {
    const toastId = toast.loading(t("CreatingInvoice"));
    try {
      await createInvoice({
        roomId,
        month: currentMonth,
        year: currentYear,
      }).unwrap();

      toast.success(t("CreateSuccess"));
      onOpenChange(false);
    } catch (error) {
      toast.error(t("CreateFailed"), {
        id: toastId,
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <FileText className="w-6 h-6" />
            {t("ConfirmCreateInvoice")}
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {t("Cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCreate}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              </>
            ) : (
              t("ConfirmCreateInvoice")
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

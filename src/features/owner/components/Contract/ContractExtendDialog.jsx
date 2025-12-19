import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ContractExtendForm from "./ContractExtendForm";
import { Clock } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

export default function ContractExtendDialog({ contract, open, onOpenChange }) {
  const { t } = useTranslation("contractinvoice");
  const handleSuccess = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Clock className="h-6 w-6" />
            {t("ExtendContractTitle")} {contract?.id}
          </DialogTitle>
        </DialogHeader>

        {contract && (
          <ContractExtendForm
            contract={contract}
            onFormSubmitSuccess={handleSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

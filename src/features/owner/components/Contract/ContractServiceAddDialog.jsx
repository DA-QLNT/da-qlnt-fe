import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import ContractServiceAddForm from "./ContractServiceAddForm";
import { Settings2 } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

export default function ContractServiceAddDialog({
  contract,
  houseId,
  open,
  onOpenChange,
}) {
  const { t } = useTranslation("contractinvoice");
  const handleSuccess = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-6 w-6" />
            {t("AddServiceToContractDialog")} {contract?.id}
          </DialogTitle>
          <DialogDescription>
            {t("SelectAvailableServices")}
          </DialogDescription>
        </DialogHeader>

        <ContractServiceAddForm
          key={contract?.id} // Force remount khi contract thay đổi
          contract={contract}
          houseId={houseId}
          onFormSubmitSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}

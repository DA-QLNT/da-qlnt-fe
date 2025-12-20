import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React from "react";
import { useTranslation } from "react-i18next";
import { FileText, SquarePen } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useGetContractByIdQuery } from "../../store/contractApi";
import ContractInforEditForm from "./ContractInforEditForm";

export default function ContractInforEditDialog({
  contractId,
  open,
  onOpenChange,
}) {
  const { t } = useTranslation("contractinvoice");

  // Lấy data chi tiết hợp đồng để điền vào form (Nếu chưa có trong cache)
  const { data: contract, isLoading } = useGetContractByIdQuery(contractId, {
    skip: !contractId,
  });

  const handleSuccess = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <SquarePen className="h-6 w-6" /> {t("EditContractInfo")}
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Spinner className="size-10 text-primary" />
            </div>
          ) : contract ? (
            <ContractInforEditForm
              contractId={contractId}
              initialData={contract}
              onFormSubmitSuccess={handleSuccess}
            />
          ) : (
            <div className="text-center text-red-500 py-10">
              {t("CannotLoadContractData")}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

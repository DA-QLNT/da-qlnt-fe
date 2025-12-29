import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useGetPendingRenewalContractQuery } from "../../store/contractApi";
import { Spinner } from "@/components/ui/spinner";
import ContractDetailView from "./ContractDetailView";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, CheckCheck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import ContractTenantConfirmDialog from "../../components/ContractTenantConfirmDialog";
import ContractTenantRejectDialog from "../../components/ContractTenantRejectDialog";

const ContractPendingRenewalTab = () => {
  const { t } = useTranslation("contractinvoice");
  const { data: contract, isLoading } = useGetPendingRenewalContractQuery();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  if (isLoading)
    return <Spinner className="size-10 mx-auto mt-10 text-primary" />;
  if (!contract)
    return (
      <div className="text-center py-10 text-muted-foreground">
        {t("NoContractPendingRenewal")}
      </div>
    );

  return (
    <div className="space-y-6">
      {contract.status === 0 && (
        <Alert variant="warning" className="bg-sidebar border-amber-200">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">
            {t("NewContractAwaitingConfirmation")}
          </AlertTitle>
          <AlertDescription className="text-amber-700">
            {t("PleaseCheckTermsBeforeConfirm")}
          </AlertDescription>
          <div className="mt-4 flex gap-3">
            <Button size="sm" onClick={() => setIsConfirmOpen(true)}>
              {t("ConfirmImmediately")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsRejectOpen(true)}
            >
              {t("Reject")}
            </Button>
          </div>
        </Alert>
      )}

      <ContractDetailView contract={contract} />

      <ContractTenantConfirmDialog
        contract={contract}
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
      />
      <ContractTenantRejectDialog
        contractId={contract.id}
        open={isRejectOpen}
        onOpenChange={setIsRejectOpen}
      />
    </div>
  );
};

export default ContractPendingRenewalTab;

import React, { useState } from "react";
import { useGetCurrentTenantContractQuery } from "../../store/contractApi";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { XCircle, CheckCheck, FileText } from "lucide-react";
import ContractDetailView from "./ContractDetailView";
import ContractTenantConfirmDialog from "../../components/ContractTenantConfirmDialog";
import ContractTenantRejectDialog from "../../components/ContractTenantRejectDialog";

const ContractCurrent = () => {
  const {
    data: contract,
    isLoading,
    isError,
  } = useGetCurrentTenantContractQuery();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  if (isLoading) return <Spinner className="size-10 mx-auto mt-10" />;
  if (isError || !contract)
    return (
      <div className="text-center py-10 text-muted-foreground">
        Anh không có hợp đồng nào đang hiệu lực.
      </div>
    );

  const isActionRequired = contract.status === 0 || contract.status === 1;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5" /> Chi tiết hợp đồng đang thuê
        </h2>
        {isActionRequired && (
          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsRejectOpen(true)}
            >
              <XCircle className="w-4 h-4 mr-2" /> Từ chối
            </Button>
            <Button size="sm" onClick={() => setIsConfirmOpen(true)}>
              <CheckCheck className="w-4 h-4 mr-2" /> Xác nhận
            </Button>
          </div>
        )}
      </div>

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

export default ContractCurrent;

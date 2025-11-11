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

export default function ContractServiceAddDialog({
  contract,
  houseId,
  open,
  onOpenChange,
}) {
  const handleSuccess = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-6 w-6" />
            Thêm Dịch vụ vào Hợp đồng #{contract?.id}
          </DialogTitle>
          <DialogDescription>
            Chọn các dịch vụ có sẵn của nhà trọ để áp dụng cho hợp đồng này.
          </DialogDescription>
        </DialogHeader>

        <ContractServiceAddForm
          contract={contract}
          houseId={houseId}
          onFormSubmitSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}

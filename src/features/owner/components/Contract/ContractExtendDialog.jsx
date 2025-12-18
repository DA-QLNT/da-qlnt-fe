import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ContractExtendForm from "./ContractExtendForm";
import { Clock } from "lucide-react";
import React from "react";

export default function ContractExtendDialog({ contract, open, onOpenChange }) {
  const handleSuccess = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Clock className="h-6 w-6" />
            Gia Hạn Hợp Đồng {contract?.id}
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

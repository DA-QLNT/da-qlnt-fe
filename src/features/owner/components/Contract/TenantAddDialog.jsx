import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import TenantAddForm from "./TenantAddForm";
import { UserPlus } from "lucide-react";
import React from "react";

export default function TenantAddDialog({ contractId, open, onOpenChange }) {
  const handleSuccess = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Thêm Khách Thuê Mới
          </DialogTitle>
        </DialogHeader>

        <TenantAddForm
          contractId={contractId}
          onFormSubmitSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}

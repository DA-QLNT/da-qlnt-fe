import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SquarePen } from "lucide-react";
import AssetItemEditForm from "./AssetItemEditForm";
import React from "react";

export default function AssetItemEditDialog({
  initialData,
  open,
  onOpenChange,
}) {
  const handleSuccess = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <SquarePen className="h-6 w-6" />
            Edit Asset Item: #{initialData?.id}
          </DialogTitle>
        </DialogHeader>

        {initialData ? (
          <AssetItemEditForm
            initialData={initialData}
            onFormSubmitSuccess={handleSuccess}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

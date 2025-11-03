import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AssetForm from "./AssetForm";
import { Plus, SquarePen } from "lucide-react";
import React from "react";

export default function AssetCreatOrUpdateDialog({ open, onOpenChange, initialData = null }) {
  const isEditMode = !!initialData?.id;

  const handleSuccess = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditMode ? (
              <SquarePen className="h-5 w-5" />
            ) : (
              <Plus className="h-5 w-5" />
            )}
            {isEditMode ? "Chỉnh sửa Loại Tài Sản" : "Thêm Loại Tài Sản Mới"}
          </DialogTitle>
        </DialogHeader>

        <AssetForm
          initialData={initialData}
          onFormSubmitSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}

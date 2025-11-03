import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import AssetItemAddForm from "./AssetItemAddForm";
import { Plus } from "lucide-react";
import React from "react";

export default function AssetItemAddDialog({ roomId, open, onOpenChange }) {
  const handleSuccess = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Plus className="h-6 w-6" />
            Thêm Item mới cho Phòng #{roomId}
          </DialogTitle>
          <DialogDescription>
            Chọn loại tài sản và thêm chi tiết mục tài sản.
          </DialogDescription>
        </DialogHeader>

        <AssetItemAddForm roomId={roomId} onFormSubmitSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import React from "react";
import RoomAddForm from "./RoomAddForm";

export default function RoomAddDialog({ houseId, open, onOpenChange }) {
  const handleSuccess = () => {
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl md:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-6 w-6" /> Thêm Phòng Mới (Nhà #{houseId})
          </DialogTitle>
          <DialogDescription>
            Nhập thông tin cơ bản và ảnh cho phòng trọ mới.
          </DialogDescription>
        </DialogHeader>
        <RoomAddForm
          houseId={houseId}
          onFormSubmitSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}

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
import { useTranslation } from "react-i18next";

export default function RoomAddDialog({ houseId, open, onOpenChange }) {
  const { t } = useTranslation("house");
  const handleSuccess = () => {
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl md:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-6 w-6" /> {t("AddNewRoom")}
          </DialogTitle>
        </DialogHeader>
        <RoomAddForm houseId={houseId} onFormSubmitSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}

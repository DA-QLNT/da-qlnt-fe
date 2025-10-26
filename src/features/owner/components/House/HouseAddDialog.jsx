import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React from "react";
import HouseAddForm from "./HouseAddForm";

const HouseAddDialog = ({ open, onOpenChange }) => {
  const handleSuccess = () => {
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl md:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Add new house
          </DialogTitle>
        </DialogHeader>
        <HouseAddForm onFormSubmitSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
};

export default HouseAddDialog;

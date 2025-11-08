import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React from "react";
import HouseForm from "./HouseForm";
import { useTranslation } from "react-i18next";

const HouseAddDialog = ({ open, onOpenChange }) => {
  const {t} = useTranslation("house")
  const handleSuccess = () => {
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl md:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {t("AddNewHouse")}
          </DialogTitle>
        </DialogHeader>
        <HouseForm mode="add" onFormSubmitSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
};

export default HouseAddDialog;

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React from "react";
import RoleAddForm from "./RoleAddForm";
import { useTranslation } from "react-i18next";

const RoleAddDialog = ({ open, onOpenChange }) => {
  const { t } = useTranslation("rolecontent");
  const handleSuccess = () => {
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("AddNewRole")}</DialogTitle>
          <DialogDescription>{t("RoleFormat")}</DialogDescription>
        </DialogHeader>
        <RoleAddForm onFormSubmitSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
};

export default RoleAddDialog;

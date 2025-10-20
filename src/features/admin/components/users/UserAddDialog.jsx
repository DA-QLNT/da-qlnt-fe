import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React from "react";
import UserAddForm from "./UserAddForm";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
const UserAddDialog = ({ open, onOpenChange }) => {
  const {t} = useTranslation("usercontent")
  const handleSuccess = () => {
    onOpenChange(false); // close dialog after create
  };
  const dialogContentClasses = cn(
    'w-full', 'sm:max-w-xl', 'md:max-w-2xl', 'lg:max-w-3xl', 'xl:max-w-4xl'
  );
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={dialogContentClasses}>
        <DialogHeader>
          <DialogTitle>{t('AddNewUser')}</DialogTitle>
        </DialogHeader>
        <UserAddForm onFormSubmitSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
};

export default UserAddDialog;

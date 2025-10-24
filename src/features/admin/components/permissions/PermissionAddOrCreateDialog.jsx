import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import React from "react";
import PermissionAddOrCreateForm from "./PermissionAddOrCreateForm ";
import { useTranslation } from "react-i18next";

const PermissionAddOrCreateDialog = ({
  open,
  onOpenChange,
  initialData = null,
}) => {
    const {t} = useTranslation('permissioncontent')
  const isEditMode = !!initialData?.id;
  const handleSuccess = () => {
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? t("CreatePermission") : t("UpdatePermission")}
          </DialogTitle>
        </DialogHeader>
        <PermissionAddOrCreateForm
          initialData={initialData}
          onFormSubmitSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
};

export default PermissionAddOrCreateDialog;

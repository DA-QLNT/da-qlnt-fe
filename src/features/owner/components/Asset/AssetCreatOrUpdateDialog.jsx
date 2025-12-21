import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AssetForm from "./AssetForm";
import { Plus, SquarePen } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

export default function AssetCreatOrUpdateDialog({ open, onOpenChange, initialData = null }) {
  const { t } = useTranslation("asset");
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
            {isEditMode ? t("DialogEditTitle") : t("DialogAddTitle")}
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

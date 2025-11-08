import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SquarePen } from "lucide-react";
import AssetItemEditForm from "./AssetItemEditForm";
import React from "react";
import { useTranslation } from "react-i18next";

export default function AssetItemEditDialog({
  initialData,
  open,
  onOpenChange,
}) {
  const { t } = useTranslation("house");
  const handleSuccess = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <SquarePen className="h-6 w-6" />
            {t("EditAssetItem")}
          </DialogTitle>
        </DialogHeader>

        {initialData ? (
          <AssetItemEditForm
            initialData={initialData}
            onFormSubmitSuccess={handleSuccess}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

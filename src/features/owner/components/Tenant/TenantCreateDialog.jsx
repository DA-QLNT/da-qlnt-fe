import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import TenantCreateForm from "./TenantCreateForm";
import { useTranslation } from "react-i18next";

export default function TenantCreateDialog({ onTenantCreated }) {
  const { t } = useTranslation("usercontent");
  const [open, setOpen] = React.useState(false);

  const handleFormSubmitSuccess = (newTenant) => {
    onTenantCreated(newTenant);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        size="sm"
        onClick={() => setOpen(true)}
        className="flex-shrink-0 mt-0"
      >
        <PlusCircle className="h-4 w-4 mr-2" />
        {t("CreateTenant")}
      </Button>

      <DialogContent className="sm:max-w-[500px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("CreateNewTenant")}</DialogTitle>
        </DialogHeader>
        <TenantCreateForm onFormSubmitSuccess={handleFormSubmitSuccess} />
      </DialogContent>
    </Dialog>
  );
}

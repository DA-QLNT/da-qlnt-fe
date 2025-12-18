import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ServiceHouseAddForm from "./ServiceHouseAddForm";
import { useTranslation } from "react-i18next";

const ServiceHouseAddDialog = ({
  open,
  onOpenChange,
  serviceId,
  serviceName,
}) => {
  const { t } = useTranslation("service");
  const handleSuccess = () => {
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={"w-[90vw] sm:max-w-4xl"}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {t("AddServiceToHouse")}: {serviceName}
          </DialogTitle>
        </DialogHeader>
        <ServiceHouseAddForm
          serviceId={serviceId}
          onFormSubmitSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ServiceHouseAddDialog;

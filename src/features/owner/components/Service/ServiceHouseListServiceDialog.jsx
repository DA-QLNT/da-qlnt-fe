import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ServiceHouseListServiceTable from "./ServiceHouseListServiceTable";
import { useTranslation } from "react-i18next";
const ServiceHouseListServiceDialog = ({
  open,
  onOpenChange,
  houseId,
  houseName,
}) => {
  const { t } = useTranslation("service");
  const handleSuccess = () => {
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={"w-full sm:w-[90vw] h-[80vh] sm:max-w-4xl"}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 mb-4">
            {t("EditServiceHouse")} {houseName}
          </DialogTitle>
          <ServiceHouseListServiceTable
            houseId={houseId}
            onFormSubmitSuccess={handleSuccess}
          />
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceHouseListServiceDialog;

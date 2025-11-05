import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ServiceHouseAddForm from "./ServiceHouseAddForm";

const ServiceHouseAddDialog = ({ open, onOpenChange, serviceId, serviceName }) => {
  const handleSuccess = () => {
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={"w-full sm:max-w-[450px]"}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Thêm dịch vụ {serviceName} vào nhà
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

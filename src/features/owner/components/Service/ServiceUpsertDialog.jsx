import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React from "react";
import ServiceUpsertForm from "./ServiceUpsertForm";
import { Plus, SquarePen } from "lucide-react";

const ServiceUpsertDialog = ({ open, onOpenChange, initialData = null }) => {
  const isEditMode = !!initialData?.id;
  const handleSuccess = () => {
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={"w-full sm:max-w-[450px]"}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditMode ? (
              <SquarePen className="h-5 w-5" />
            ) : (
              <Plus className="h-5 w-5" />
            )}
            {isEditMode ? "Chỉnh sửa Dịch vụ" : "Thêm Dịch vụ Mới"}
          </DialogTitle>
        </DialogHeader>
        <ServiceUpsertForm
          initialData={initialData}
          onFormSubmitSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ServiceUpsertDialog;

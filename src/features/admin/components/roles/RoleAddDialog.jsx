import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import React from "react";
import RoleAddForm from "./RoleAddForm";

const RoleAddDialog = ({ open, onOpenChange }) => {
  const handleSuccess = () => {
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add new role</DialogTitle>
          <DialogDescription>
            Role name need to be unique & uppercase
          </DialogDescription>
        </DialogHeader>
        <RoleAddForm onFormSubmitSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
};

export default RoleAddDialog;

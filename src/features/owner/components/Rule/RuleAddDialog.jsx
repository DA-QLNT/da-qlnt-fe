import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import React from "react";
import RuleAddForm from "./RuleAddForm";

const RuleAddDialog = ({ open, onOpenChange }) => {
  const handleSuccess = () => {
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={"sm:max-w-[425px]"}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Add new rule
          </DialogTitle>
        </DialogHeader>
        <RuleAddForm onFormSubmitSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
};

export default RuleAddDialog;

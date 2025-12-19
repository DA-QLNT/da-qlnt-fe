import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React from "react";
import RuleEditForm from "./RuleEditForm";
import { useTranslation } from "react-i18next";

const RuleEditDialog = ({ ruleId, open, onOpenChange }) => {
  const { t } = useTranslation("repairreportrule");
  const handleSuccess = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={"sm:max-w-[425px]"}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">{t("EditRule")}</DialogTitle>
        </DialogHeader>
        <RuleEditForm ruleId={ruleId} onFormSubmitSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
};

export default RuleEditDialog;

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import React from "react";
import { useGetRuleByIdQuery } from "../../store/houseApi";
import { Spinner } from "@/components/ui/spinner";
import { useTranslation } from "react-i18next";

const RuleViewDialog = ({ ruleId, open, onOpenChange }) => {
  const { t } = useTranslation("repairreportrule");
  const { data: rule, isLoading } = useGetRuleByIdQuery(ruleId, { skip: !ruleId });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("ViewRule")}</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="py-6 text-center"><Spinner /></div>
        ) : rule ? (
          <div className="space-y-3">
            <h4 className="font-semibold">{rule.name}</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{rule.description}</p>
          </div>
        ) : (
          <div className="py-6 text-center text-red-500">{t("CannotLoadRule")}</div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RuleViewDialog;

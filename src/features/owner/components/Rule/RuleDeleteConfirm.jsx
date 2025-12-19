import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteRuleMutation } from "../../store/houseApi";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const RuleDeleteConfirm = ({ ruleId, open, onOpenChange, onDeleted }) => {
  const { t } = useTranslation("repairreportrule");
  const [deleteRule, { isLoading }] = useDeleteRuleMutation();

  const handleDelete = async () => {
    try {
      await deleteRule(ruleId).unwrap();
      toast.success(t("DeleteSuccess") || "Xóa thành công");
      onDeleted?.();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error(t("DeleteFailed") || "Xóa thất bại");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>{t("ConfirmDelete")}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>{t("DeleteRuleConfirm") || "Bạn có chắc muốn xóa nội quy này?"}</p>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              {t("Cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {t("Delete")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RuleDeleteConfirm;

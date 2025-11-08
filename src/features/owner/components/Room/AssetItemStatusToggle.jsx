import React from "react";
import { Switch } from "@/components/ui/switch";
import { useUpdateAssetItemStatusMutation } from "../../store/roomApi";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

export default function AssetItemStatusToggle({ item }) {
  const { t } = useTranslation("house");
  const [updateStatus, { isLoading }] = useUpdateAssetItemStatusMutation();

  // Status: 0 (Tốt), 1 (Hỏng). checked=true -> Hỏng (1)
  const isFaulty = item.status === 1;

  const handleStatusToggle = async (checked) => {
    const newStatus = checked ? 0 : 1;
    const toastId = toast.loading(t("UpdatingStatus"));

    try {
      await updateStatus({
        itemId: item.id,
        status: newStatus,
      }).unwrap();

      toast.success(t("UpdateSuccess"), { id: toastId });
    } catch (error) {
      toast.error(t("UpdateFail"), { id: toastId });
      console.error("Asset item status update error:", error);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={!isFaulty}
        onCheckedChange={handleStatusToggle}
        disabled={isLoading}
      />
      <Badge variant={isFaulty ? "destructive" : "success"}>
        {isFaulty ? t("Bad") : t("Good")}
      </Badge>
    </div>
  );
}

import React from "react";
import { Switch } from "@/components/ui/switch";
import { useUpdateAssetItemStatusMutation } from "../../store/roomApi";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";


export default function AssetItemStatusToggle({ item }) {
  const [updateStatus, { isLoading }] = useUpdateAssetItemStatusMutation();

  // Status: 0 (Tốt), 1 (Hỏng). checked=true -> Hỏng (1)
  const isFaulty = item.status === 1;

  const handleStatusToggle = async (checked) => {
    const newStatus = checked ? 0 : 1;
    const toastId = toast.loading(`Đang cập nhật ${item.assetName}...`);

    try {
      await updateStatus({
        itemId: item.id,
        status: newStatus,
      }).unwrap();

      toast.success(
        `Cập nhật Item ${item.id} thành ${newStatus === 0 ? "Tốt" : "Hỏng"}`,
        { id: toastId }
      );
    } catch (error) {
      toast.error("Cập nhật trạng thái thất bại.", { id: toastId });
      console.error("Asset item status update error:", error);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={!isFaulty}
        onCheckedChange={handleStatusToggle}
        disabled={isLoading}
        title={isFaulty ? "Chuyển sang Tốt" : "Chuyển sang Hỏng"}
      />
      <Badge variant={isFaulty ? "destructive" : "success"}>
        {isFaulty ? "Hỏng" : "Tốt"}
      </Badge>
    </div>
  );
}

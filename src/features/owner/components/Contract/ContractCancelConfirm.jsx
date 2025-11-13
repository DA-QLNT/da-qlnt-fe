import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCancelContractMutation } from "../../store/contractApi";
import { XCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import React from "react";
import { Button } from "@/components/ui/button";

/**
 * Dialog xác nhận hủy hợp đồng (DRAFT/PENDING -> CANCELLED)
 * @param {object} contract - Dữ liệu hợp đồng
 */
export default function ContractCancelConfirm({
  contract,
  open,
  onOpenChange,
}) {
  const [cancelContract, { isLoading }] = useCancelContractMutation();

  const contractId = contract?.id;
  const isDraft = contract?.status === 0;

  const handleCancel = async () => {
    const toastId = toast.loading(`Đang hủy hợp đồng #${contractId}...`);
    try {
      await cancelContract(contractId).unwrap();

      toast.success(`Hợp đồng #${contractId} đã được HỦY bỏ thành công.`, {
        id: toastId,
        duration: 5000,
      });
      onOpenChange(false); // Đóng dialog
    } catch (error) {
      toast.error(error.data?.message || "Hủy hợp đồng thất bại.", {
        id: toastId,
      });
      console.error("Lỗi hủy hợp đồng:", error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <XCircle className="w-6 h-6" />
            Xác nhận Hủy Hợp đồng
          </AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn HỦY BỎ hợp đồng #{contractId} không?
            {isDraft ? (
              <span className="mt-2 block font-medium">
                Hợp đồng đang ở trạng thái bản nháp (DRAFT).
              </span>
            ) : (
              <span className="mt-2 block font-medium">
                Hợp đồng đang CHỜ HIỆU LỰC (PENDING).
              </span>
            )}
            <p className="mt-2 text-red-500">
              Hợp đồng sẽ chuyển sang trạng thái CANCELLED.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            Không (Giữ lại)
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang hủy...
              </>
            ) : (
              "Đồng ý Hủy bỏ"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

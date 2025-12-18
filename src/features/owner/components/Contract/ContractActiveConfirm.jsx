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
import { useActivateContractMutation } from "../../store/contractApi";
import { Play, AlertTriangle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import React from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

/**
 * Dialog xác nhận kích hoạt hợp đồng (DRAFT -> PENDING/ACTIVE)
 * @param {object} contract - Dữ liệu hợp đồng
 */
export default function ContractActivateConfirm({
  contract,
  open,
  onOpenChange,
}) {
  const [activateContract, { isLoading }] = useActivateContractMutation();

  const contractId = contract?.id;
  const startDate = contract?.startDate
    ? format(new Date(contract.startDate), "dd/MM/yyyy")
    : "N/A";
  const isPending = contract && new Date(contract.startDate) > new Date();

  const handleActivate = async () => {
    const toastId = toast.loading(`Đang kích hoạt hợp đồng ${contractId}...`);
    try {
      await activateContract(contractId).unwrap();

      toast.success(
        `Kích hoạt thành công! Hợp đồng đang ở trạng thái ${
          isPending ? "CHỜ HIỆU LỰC (PENDING)" : "ACTIVE"
        }`,
        { id: toastId, duration: 5000 }
      );
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error.data?.message ||
          "Kích hoạt thất bại. Vui lòng kiểm tra dữ liệu hợp đồng.",
        { id: toastId }
      );
      console.error("Lỗi kích hoạt:", error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 ">
            <Play className="w-6 h-6" />
            Xác nhận Kích hoạt Hợp đồng
          </AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn kích hoạt hợp đồng {contractId} không?
            {isPending ? (
              <span className="mt-2 block text-yellow-600 font-medium">
                Hợp đồng sẽ chuyển sang trạng thái PENDING (Chờ hiệu lực vào{" "}
                {startDate}).
              </span>
            ) : (
              <span className="mt-2 block text-yellow-600 font-medium">
                Hợp đồng sẽ chuyển sang trạng thái ACTIVE ngay lập tức.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Hủy bỏ</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleActivate}
            disabled={isLoading}
            className="bg-green-400 hover:bg-green-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang kích
                hoạt...
              </>
            ) : (
              "Đồng ý Kích hoạt"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

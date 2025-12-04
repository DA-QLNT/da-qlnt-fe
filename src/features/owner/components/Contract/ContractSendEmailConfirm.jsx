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
import { useSendContractEmailMutation } from "../../store/contractApi"; // 🚨 Import hook
import { Mail, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import React from "react";
import { Button } from "@/components/ui/button";

/**
 * Dialog xác nhận gửi email hợp đồng cho khách thuê.
 * @param {object} contract - Dữ liệu hợp đồng
 */
export default function ContractSendEmailConfirm({
  contract,
  open,
  onOpenChange,
}) {
  const [sendEmail, { isLoading }] = useSendContractEmailMutation();

  const contractId = contract?.id;

  const handleSend = async () => {
    const toastId = toast.loading(
      `Đang gửi hợp đồng #${contractId} qua email...`
    );
    try {
      await sendEmail(contractId).unwrap();

      toast.success(
        `Hợp đồng #${contractId} đã được gửi email thành công cho khách thuê!`,
        { id: toastId, duration: 5000 }
      );
      onOpenChange(false); // Đóng dialog
    } catch (error) {
      toast.error(error.data?.message || "Gửi email thất bại.", {
        id: toastId,
      });
      console.error("Lỗi gửi email:", error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-primary">
            <Mail className="w-6 h-6" />
            Xác nhận Gửi Email Hợp đồng
          </AlertDialogTitle>
          <AlertDialogDescription>
            Anh có chắc chắn muốn gửi email thông báo hợp đồng **#{contractId}**
            tới người thuê không? Thao tác này sẽ gửi bản PDF hợp đồng và thông
            tin xác nhận tới email của người đại diện.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Hủy bỏ</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSend}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang gửi...
              </>
            ) : (
              "Đồng ý Gửi Email"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

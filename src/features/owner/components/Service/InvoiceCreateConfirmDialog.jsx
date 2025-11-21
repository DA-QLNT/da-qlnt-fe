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
import { useCreateInvoiceMutation } from "../../store/serviceApi";
import { FileText, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import React from "react";
import { Button } from "@/components/ui/button";

export default function InvoiceCreateConfirmDialog({
  roomId,
  open,
  onOpenChange,
}) {
  const [createInvoice, { isLoading }] = useCreateInvoiceMutation();
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const handleCreate = async () => {
    const toastId = toast.loading(
      `Đang tạo hóa đơn tháng ${currentMonth}/${currentYear}...`
    );
    try {
      await createInvoice({
        roomId,
        month: currentMonth,
        year: currentYear,
      }).unwrap();

      toast.success(
        `Hóa đơn tháng ${currentMonth}/${currentYear} đã được tạo thành công!`,
        { id: toastId }
      );
      onOpenChange(false);
    } catch (error) {
      toast.error(error.data?.message || "Tạo hóa đơn thất bại.", {
        id: toastId,
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Xác nhận Tạo Hóa đơn
          </AlertDialogTitle>
          <AlertDialogDescription>
            Anh có chắc chắn muốn tạo hóa đơn cho Phòng #{roomId} kỳ **Tháng{" "}
            {currentMonth}/{currentYear}** không? Thao tác này sẽ khóa chỉ số
            dịch vụ cho tháng này.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCreate}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tạo...
              </>
            ) : (
              "Đồng ý Tạo Hóa đơn"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

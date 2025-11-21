import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import ContractAddForm from "./ContractAddForm";
import { FileText } from "lucide-react";
import { formatCurrency } from "@/lib/format/currencyFormat";

export default function ContractAddDialog({
  houseId,
  roomId,
  open,
  onOpenChange,
}) {
  const handleSuccess = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:w-[90vw] h-[80vh] sm:max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-6 w-6" />
            Tạo Hợp Đồng Thuê Phòng
          </DialogTitle>
        </DialogHeader>

        <ContractAddForm
          houseId={houseId}
          roomId={roomId}
          onFormSubmitSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}

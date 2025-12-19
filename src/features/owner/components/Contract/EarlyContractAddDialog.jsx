import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { FileText } from "lucide-react";
import { formatCurrency } from "@/lib/format/currencyFormat";
import EarlyContractAddForm from "./EarlyContractAddForm";
import { useTranslation } from "react-i18next";

export default function EarlyContractAddDialog({
  houseId,
  roomId,
  open,
  onOpenChange,
}) {
  const { t } = useTranslation("contractinvoice");
  const handleSuccess = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:w-[90vw] h-[80vh] sm:max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-6 w-6" />
            {t("CreateRoomRentalContract")}
          </DialogTitle>
        </DialogHeader>

        <EarlyContractAddForm onFormSubmitSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}

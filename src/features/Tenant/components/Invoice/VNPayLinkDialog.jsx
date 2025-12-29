import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, CreditCard } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function VNPayLinkDialog({ paymentUrl, open, onOpenChange }) {
  const { t } = useTranslation("service");
  const handleGoToVNPay = () => {
    if (paymentUrl) {
      // window.open(paymentUrl, "_blank"); // Mở trang thanh toán ở tab mới

      window.location.href = paymentUrl; // Chuyển hướng ngay trên tab hiện tại để đảm bảo tính liền mạch
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="text-primary" /> {t("ReadyToPay")}
          </DialogTitle>
          <DialogDescription>{t("PaymentLinkCreated")}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-6 space-y-4">
          <div className="p-4 bg-background rounded-full">
            <CreditCard className="h-12 w-12 text-primary animate-pulse" />
          </div>
          <p className="text-center text-sm text-muted-foreground">
            {t("PleaseProceedToVNPay")}
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("Later")}
          </Button>
          <Button
            onClick={handleGoToVNPay}
            className="gap-2  hover:bg-[#1a83c0]"
          >
            {t("GoToVNPay")} <ExternalLink className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

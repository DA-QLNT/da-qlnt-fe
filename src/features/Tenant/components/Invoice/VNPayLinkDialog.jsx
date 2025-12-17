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

export default function VNPayLinkDialog({ paymentUrl, open, onOpenChange }) {
  const handleGoToVNPay = () => {
    if (paymentUrl) {
      window.open(paymentUrl, "_blank"); // Mở trang thanh toán ở tab mới
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="text-blue-600" /> Sẵn sàng thanh toán
          </DialogTitle>
          <DialogDescription>
            Hệ thống đã khởi tạo link thanh toán an toàn qua cổng VNPay.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-6 space-y-4">
          <div className="p-4 bg-blue-50 rounded-full">
            <CreditCard className="h-12 w-12 text-blue-500 animate-pulse" />
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Anh vui lòng nhấn vào nút bên dưới để chuyển sang trang cổng thanh
            toán VNPay.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Để sau
          </Button>
          <Button
            onClick={handleGoToVNPay}
            className="gap-2  hover:bg-[#1a83c0]"
          >
            Đến trang VNPay <ExternalLink className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

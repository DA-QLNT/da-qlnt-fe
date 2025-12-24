import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Spinner } from "@/components/ui/spinner";

const VNPayReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation("service");

  useEffect(() => {
    const responseCode = searchParams.get("vnp_ResponseCode");

    // VNPay ResponseCode "00" là thành công
    if (responseCode === "00") {
      toast.success(t("PaymentSuccess"));
    } else {
      // Các mã lỗi khác hoặc người dùng ấn nút Hủy (mã 24)
      console.error("VNPay Error Code:", responseCode);
      toast.error(t("PaymentFailed"));
    }

    // Luôn điều hướng về trang hóa đơn sau khi xử lý xong
    const timer = setTimeout(() => {
      navigate("/tenant/invoices", { replace: true });
    }, 1500); // Đợi 1.5s để người dùng kịp nhìn Spinner (tùy chọn)

    return () => clearTimeout(timer);
  }, [searchParams, navigate, t]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <Spinner className="size-12" />
      <p className="text-muted-foreground animate-pulse">
        {t("ProcessingPaymentResult")}
      </p>
    </div>
  );
};

export default VNPayReturn;

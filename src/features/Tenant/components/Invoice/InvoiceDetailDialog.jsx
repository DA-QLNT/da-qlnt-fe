import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useGetInvoiceDetailQuery } from "../../store/invoiceApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/format/currencyFormat";
import {
  FileText,
  Info,
  Loader2,
  Calendar as CalendarIcon,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format/dateTimeFormat";
import { Badge } from "@/components/ui/badge";
import ServiceTypeBadge from "../../../owner/components/Service/ServiceTypeBadge";

const INVOICE_STATUS_MAP = {
  0: "Chưa thanh toán",
  1: "Đã thanh toán",
  2: "Quá hạn",
  3: "Đã thanh toán quá hạn",
};

const PAYMENT_METHOD_MAP = {
  0: "Tiền mặt",
  1: "Chuyển khoản",
};

export default function InvoiceDetailDialog({ invoiceId, open, onOpenChange }) {
  const {
    data: invoice,
    isLoading,
    isFetching,
    isError,
  } = useGetInvoiceDetailQuery(invoiceId, { skip: !invoiceId || !open });

  const loading = isLoading || isFetching;

  if (isError)
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>Lỗi tải chi tiết hóa đơn.</DialogContent>
      </Dialog>
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Chi tiết Hóa đơn {invoice?.code}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
            <p className="mt-2 text-muted-foreground">Đang tải dữ liệu...</p>
          </div>
        ) : invoice ? (
          <div className="space-y-6">
            {/* 1. THÔNG TIN CHUNG */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Info className="h-4 w-4" /> Thông tin chung
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phòng:</span>
                    <span className="font-medium">{invoice.roomCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kỳ hóa đơn:</span>
                    <span className="font-medium">
                      Tháng {invoice.month}/{invoice.year}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Trạng thái:</span>
                    <Badge
                      variant={
                        invoice.status === 1
                          ? "success"
                          : invoice.status === 2
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {INVOICE_STATUS_MAP[invoice.status]}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" /> Thời gian & Thanh toán
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Hạn thanh toán:
                    </span>
                    <span className="font-medium text-red-500">
                      {formatDateTime(invoice.dueDate).formattedDate}
                    </span>
                  </div>
                  {invoice.status === 1 && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Ngày thanh toán:
                        </span>
                        <span className="font-medium text-green-600">
                          {formatDateTime(invoice.paymentDate).formattedDate}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Phương thức:
                        </span>
                        <span className="font-medium">
                          {PAYMENT_METHOD_MAP[invoice.paymentMethod] || "N/A"}
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 2. DỊCH VỤ VÀ CHI PHÍ */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  Chi tiết dịch vụ sử dụng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dịch vụ</TableHead>
                      <TableHead>Cách tính</TableHead>
                      <TableHead className="text-right">Đơn giá</TableHead>
                      <TableHead className="text-right">Số lượng</TableHead>
                      <TableHead className="text-right">Thành tiền</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Tiền Phòng */}
                    <TableRow className="font-semibold">
                      <TableCell>Tiền thuê phòng</TableCell>
                      <TableCell>Cố định</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(invoice.rentAmount)}
                      </TableCell>
                      <TableCell className="text-right">1</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(invoice.rentAmount)}
                      </TableCell>
                    </TableRow>

                    {/* Chi tiết Dịch vụ */}
                    {invoice.serviceDetails?.map((detail) => (
                      <TableRow key={detail.id} className="text-sm">
                        <TableCell className="font-medium">
                          {detail.houseService.serviceName}
                        </TableCell>
                        <TableCell>
                          <ServiceTypeBadge type={Number(detail.method)} />
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(detail.unitPrice)}
                        </TableCell>
                        <TableCell className="text-right">
                          {detail.quantity}{" "}
                          <span className="text-[10px] text-muted-foreground uppercase">
                            {detail.method === "0" ? "Số" : "Người/Lần"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(detail.amount)}
                        </TableCell>
                      </TableRow>
                    ))}

                    {/* Tổng cộng */}
                    <TableRow className="font-bold bg-muted/50">
                      <TableCell colSpan={4} className="text-right text-base">
                        TỔNG CỘNG
                      </TableCell>
                      <TableCell className="text-right text-xl text-primary">
                        {formatCurrency(invoice.totalAmount)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        ) : null}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          {/* {invoice?.status !== 1 && (
            <Button className="gap-2">
              <CreditCard className="h-4 w-4" /> Thanh toán
            </Button>
          )} */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

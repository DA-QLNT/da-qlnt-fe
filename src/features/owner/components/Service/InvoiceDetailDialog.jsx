import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useGetInvoiceByIdQuery,
  useCreateInvoiceMutation,
} from "../../store/serviceApi"; // 🚨 Import createInvoice
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
import { FileText, Info, DollarSign, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format/dateTimeFormat";
import { Badge } from "@/components/ui/badge";
import React, { useState } from "react";
import InvoiceCreateConfirmDialog from "./InvoiceCreateConfirmDialog";

const INVOICE_STATUS_MAP = {
  0: "Chưa thanh toán",
  1: "Đã thanh toán",
  2: "Đã hủy",
};

export default function InvoiceDetailDialog({ invoiceId, open, onOpenChange }) {
  const {
    data: invoice,
    isLoading,
    isFetching,
    isError,
  } = useGetInvoiceByIdQuery(invoiceId, { skip: !invoiceId || !open });
  const loading = isLoading || isFetching;

  // 🚨 LOGIC TẠO HÓA ĐƠN TRONG FOOTER
  const [isCreateConfirmOpen, setIsCreateConfirmOpen] = useState(false);

  const handleOpenCreateConfirm = () => {
    setIsCreateConfirmOpen(true);
  };

  if (isError)
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>Lỗi tải chi tiết hóa đơn.</DialogContent>
      </Dialog>
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* RENDER CONFIRM DIALOG CON */}
      <InvoiceCreateConfirmDialog
        roomId={invoice?.roomId}
        open={isCreateConfirmOpen}
        onOpenChange={setIsCreateConfirmOpen}
      />

      <DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" /> Chi tiết Hóa đơn {invoice?.month}/
            {invoice?.year}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-10">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          </div>
        ) : invoice ? (
          <div className="space-y-6">
            {/* 1. THÔNG TIN CHUNG */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info /> Thông tin chung
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium w-1/4">Phòng</TableCell>
                      <TableCell>
                        {invoice.roomCode} ({invoice.houseName})
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Khách thuê</TableCell>
                      <TableCell>{invoice.tenantName}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Trạng thái</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            invoice.status === 1 ? "success" : "secondary"
                          }
                        >
                          {INVOICE_STATUS_MAP[invoice.status]}
                        </Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        Hạn thanh toán
                      </TableCell>
                      <TableCell>
                        {formatDateTime(invoice.dueDate).formattedDate}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* 2. DỊCH VỤ VÀ CHI PHÍ */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign /> Chi tiết thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dịch vụ</TableHead>
                      <TableHead>Cách tính</TableHead>
                      <TableHead>Đơn giá</TableHead>
                      <TableHead>Số lượng</TableHead>
                      <TableHead className="text-right">Tổng tiền</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Tiền Phòng */}
                    <TableRow className="font-semibold">
                      <TableCell>Tiền thuê phòng</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>1</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(invoice.rentAmount)}
                      </TableCell>
                    </TableRow>
                    {/* Chi tiết Dịch vụ */}
                    {invoice.serviceDetails?.map((detail) => (
                      <TableRow key={detail.id} className="text-sm">
                        <TableCell>{detail.houseService.serviceName}</TableCell>
                        <TableCell>
                          {detail.method === "0" ? "Công tơ" : "Khác"}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(detail.unitPrice)}
                        </TableCell>
                        <TableCell>
                          {detail.quantity}{" "}
                          {detail.method === "0" ? "đơn vị" : "người/lần"}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(detail.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* Tổng cộng */}
                    <TableRow className="font-bold bg-secondary">
                      <TableCell colSpan={4}>TỔNG CỘNG</TableCell>
                      <TableCell className="text-right text-lg text-primary">
                        {formatCurrency(invoice.totalAmount)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        ) : null}

        <DialogFooter>
          <Button
            onClick={handleOpenCreateConfirm}
            variant="default"
            disabled={invoice?.status !== 0}
          >
            Tạo Hóa Đơn Mới
          </Button>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          {/* 🚨 Chức năng xuất PDF/In (Nếu cần) */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

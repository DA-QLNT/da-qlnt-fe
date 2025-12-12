import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetInvoicesByRoomIdQuery } from "../../store/serviceApi";
import { FileText, DollarSign, Clock, Eye } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency } from "@/lib/format/currencyFormat";
import { formatDateTime } from "@/lib/format/dateTimeFormat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import React, { useMemo, useState } from "react";
import InvoiceDetailDialog from "./InvoiceDetailDialog"; //  Import Detail Dialog

const INVOICE_STATUS_MAP = {
  0: "Chưa thanh toán",
  1: "Đã thanh toán",
  2: "Đã hủy",
}; // Giả định status

export default function InvoiceListDialog({ roomId, open, onOpenChange }) {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Fetch danh sách hóa đơn
  const {
    data: invoices,
    isLoading,
    isFetching,
    isError,
  } = useGetInvoicesByRoomIdQuery(roomId, { skip: !roomId || !open });

  const assignedInvoices = invoices || [];

  //  Sắp xếp theo Năm (DESC) và Tháng (DESC)
  const sortedInvoices = useMemo(() => {
    return [...assignedInvoices].sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
  }, [assignedInvoices]);

  const handleViewDetail = (invoiceId) => {
    setSelectedInvoiceId(invoiceId);
    setIsDetailOpen(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* RENDER DETAIL DIALOG */}
      <InvoiceDetailDialog
        invoiceId={selectedInvoiceId}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />

      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" /> Lịch sử Hóa đơn Phòng #{roomId}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-secondary z-10">
              <TableRow>
                <TableHead className="w-[50px]">Kỳ</TableHead>
                <TableHead>Tổng tiền</TableHead>
                <TableHead>Ngày đến hạn</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading || isFetching ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <Spinner />
                  </TableCell>
                </TableRow>
              ) : sortedInvoices.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground"
                  >
                    Chưa có hóa đơn nào.
                  </TableCell>
                </TableRow>
              ) : (
                sortedInvoices.map((invoice) => (
                  <TableRow
                    key={invoice.id}
                    className={
                      invoice.status === 1
                        ? "bg-green-50/50 dark:bg-green-900/10"
                        : ""
                    }
                  >
                    <TableCell className="font-medium">
                      {invoice.month}/{invoice.year}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(invoice.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-red-500" />
                        {formatDateTime(invoice.dueDate).formattedDate}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          invoice.status === 1
                            ? "success"
                            : invoice.overdueStatus === 1
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {INVOICE_STATUS_MAP[invoice.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetail(invoice.id)}
                      >
                        <Eye className="h-4 w-4" /> Xem chi tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

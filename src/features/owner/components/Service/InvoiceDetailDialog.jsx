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
  useExportInvoiceExcelMutation,
} from "../../store/serviceApi";
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
import { FileText, Info, DollarSign, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format/dateTimeFormat";
import { Badge } from "@/components/ui/badge";
import React, { useState } from "react";
import InvoiceCreateConfirmDialog from "./InvoiceCreateConfirmDialog";
import toast from "react-hot-toast";
import ServiceTypeBadge from "./ServiceTypeBadge";

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

  const [isCreateConfirmOpen, setIsCreateConfirmOpen] = useState(false);

  // ✅ Sử dụng RTK Query để export Excel
  const [triggerExport, { isLoading: isExporting }] =
    useExportInvoiceExcelMutation();

  const handleOpenCreateConfirm = () => {
    setIsCreateConfirmOpen(true);
  };

  // ✅ HÀM XUẤT EXCEL với RTK Query
  const handleExportExcel = async () => {
    if (!invoice) {
      toast.error("Không có dữ liệu hóa đơn để xuất");
      return;
    }

    try {
      const blobResult = await triggerExport({
        roomId: invoice.roomId,
        month: invoice.month,
        year: invoice.year,
      }).unwrap(); //  Nếu thành công, blobResult là đối tượng Blob

      // Tạo Blob mới từ kết quả để ép kiểu (quan trọng để khắc phục lỗi trình duyệt)
      const excelBlob = new Blob([blobResult], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Tạo URL để download và kích hoạt download
      const downloadUrl = window.URL.createObjectURL(excelBlob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `HoaDon_${invoice.roomCode}_${invoice.month}_${invoice.year}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(downloadUrl);
      toast.success("Xuất Excel thành công!");
    } catch (error) {
      //  Bắt lỗi JSON từ server (do responseHandler ném ra)
      console.error("Export Excel error:", error);
      // Hiển thị message lỗi chi tiết từ server nếu có
      const errorMessage =
        error.message || error.data?.message || "Xuất Excel thất bại.";
      toast.error(errorMessage);
    }
  };

  if (isError)
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>Lỗi tải chi tiết hóa đơn.</DialogContent>
      </Dialog>
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <InvoiceCreateConfirmDialog
        roomId={invoice?.roomId}
        open={isCreateConfirmOpen}
        onOpenChange={setIsCreateConfirmOpen}
      />

      <DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6" /> Chi tiết Hóa đơn {invoice?.month}
              /{invoice?.year}
            </div>
            <Button
              className="mr-8"
              onClick={handleExportExcel}
              disabled={isExporting || loading}
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Đang xuất...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Xuất Excel
                </>
              )}
            </Button>
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
                      <TableCell>{invoice.roomCode}</TableCell>
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
                  Chi tiết thanh toán
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
                          <ServiceTypeBadge type={detail.method} />
                        </TableCell>
                        <TableCell>
                          {formatCurrency(detail.unitPrice)}
                        </TableCell>
                        <TableCell>
                          {detail.quantity}{" "}
                          {detail.method === "0" ? "số" : "người/lần"}
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

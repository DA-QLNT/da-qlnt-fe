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
  useExportInvoiceByInvoiceIdMutation,
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
import {
  FileText,
  Info,
  DollarSign,
  Loader2,
  Download,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format/dateTimeFormat";
import { Badge } from "@/components/ui/badge";
import React, { useState } from "react";
import InvoiceCreateConfirmDialog from "./InvoiceCreateConfirmDialog";
import toast from "react-hot-toast";
import ServiceTypeBadge from "./ServiceTypeBadge";
import { useTranslation } from "react-i18next";
import InvoiceStatusBadge from "@/features/Tenant/components/Invoice/InvoiceStatusBadge";
import { REPAIR_STATUS_MAP } from "@/assets/repair/repairStatus";

const INVOICE_STATUS_MAP = {
  0: "Unpaid",
  1: "Paid",
  2: "Overdue",
  3: "OverduePaid",
};

export default function InvoiceDetailDialog({ invoiceId, open, onOpenChange }) {
  const { t } = useTranslation("service");
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
    useExportInvoiceByInvoiceIdMutation();

  const handleOpenCreateConfirm = () => {
    setIsCreateConfirmOpen(true);
  };

  // ✅ HÀM XUẤT EXCEL CẬP NHẬT
  const handleExportExcel = async () => {
    if (!invoiceId) {
      toast.error(t("NoInvoice"));
      return;
    }

    try {
      // 🚨 Truyền trực tiếp invoiceId vào trigger
      const blobResult = await triggerExport(invoiceId).unwrap();

      const excelBlob = new Blob([blobResult], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const downloadUrl = window.URL.createObjectURL(excelBlob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      // Đặt tên file linh hoạt dựa trên dữ liệu invoice nếu có, hoặc dùng ID
      const fileName = invoice
        ? `HoaDon_${invoice.roomCode}_${invoice.month}_${invoice.year}.xlsx`
        : `HoaDon_ChiTiet_${invoiceId}.xlsx`;

      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(downloadUrl);
      toast.success(t("ExportSuccess"));
    } catch (error) {
      console.error("Export Excel error:", error);
      const errorMessage = error?.data?.message || t("ExportFailed");
      toast.error(errorMessage);
    }
  };

  if (isError)
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>{t("ErrorLoadingInvoiceDetail")}</DialogContent>
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
              <FileText className="h-6 w-6" /> {t("InvoiceDetail")}{" "}
              {invoice?.code} - {invoice?.month}/{invoice?.year}
            </div>
            <Button
              className="mr-8"
              onClick={handleExportExcel}
              disabled={isExporting || loading}
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  {t("ExportExcel")}
                </>
              )}
            </Button>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-10">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          </div>
        ) : invoice ? (
          <div className="space-y-6">
            {/* 1. THÔNG TIN CHUNG */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info /> {t("GeneralInfo")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium w-1/4">
                        {t("Room")}
                      </TableCell>
                      <TableCell>{invoice.roomCode}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        {t("Tenant")}
                      </TableCell>
                      <TableCell>{invoice.tenantName}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        {t("Status")}
                      </TableCell>
                      <TableCell>
                        <InvoiceStatusBadge status={invoice.status}>
                          {t(INVOICE_STATUS_MAP[invoice.status])}
                        </InvoiceStatusBadge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        {t("PaymentDeadline")}
                      </TableCell>
                      <TableCell>
                        {formatDateTime(invoice.dueDate).formattedDate}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>{t("PaymentDate")}</TableCell>
                      <TableCell>
                        {formatDateTime(invoice.paymentDate).formattedDate}
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
                  {t("InvoicePaymentDetails")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className={"font-bold"}>
                      <TableHead>{t("ServiceName")}</TableHead>
                      <TableHead>{t("Method")}</TableHead>
                      <TableHead>{t("UnitPrice")}</TableHead>
                      <TableHead>{t("Quantity")}</TableHead>
                      <TableHead className="text-right">
                        {t("Amount")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Tiền Phòng */}
                    <TableRow className="">
                      <TableCell>{t("RentFee")}</TableCell>
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
                          {detail.method === "0"
                            ? t("NumberShort")
                            : t("PersonShort")}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(detail.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* 3. DANH SÁCH SỬA CHỮA */}
            {invoice.repairs && invoice.repairs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {t("Repairs") || "Repairs"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className={"font-bold"}>
                        <TableHead>{t("Title")}</TableHead>
                        <TableHead>{t("Room")}</TableHead>
                        <TableHead>{t("TenantRequest")}</TableHead>

                        <TableHead>
                          {t("CreatedAt") || "Created Date"}
                        </TableHead>
                        <TableHead>
                          {t("CompletedDate") || "Completed Date"}
                        </TableHead>
                        <TableHead className="text-right">
                          {t("Cost") || "Cost"}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoice.repairs.map((repair) => (
                        <TableRow key={repair.id} className="text-sm">
                          <TableCell className="font-medium">
                            {repair.title}
                          </TableCell>
                          <TableCell>{repair.roomName || "-"}</TableCell>
                          <TableCell>{repair.tenantName}</TableCell>

                          <TableCell>
                            {formatDateTime(repair.createdAt).formattedDate}
                          </TableCell>
                          <TableCell>
                            {repair.completedDate
                              ? formatDateTime(repair.completedDate)
                                  .formattedDate
                              : "-"}
                          </TableCell>
                          <TableCell className="text-right  ">
                            {formatCurrency(repair.cost)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
            {/* Tổng cộng */}
            <div className="font-bold flex gap-2 items-center justify-self-end">
              <span>{t("TotalUpper")}</span>
              <span className="text-right text-lg text-primary">
                {formatCurrency(invoice.totalAmount)}
              </span>
            </div>
          </div>
        ) : null}

        <DialogFooter>
          {/* <Button
            onClick={handleOpenCreateConfirm}
            variant="default"
            disabled={invoice?.status !== 0}
          >
            {t("CreateNewInvoice")}
          </Button> */}
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {t("Close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

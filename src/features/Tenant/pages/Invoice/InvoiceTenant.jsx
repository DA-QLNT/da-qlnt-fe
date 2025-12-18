import React, { useState } from "react";
import { useGetCurrentTenantContractQuery } from "../../store/contractApi";
import {
  useCreateVNPayUrlMutation,
  useGetInvoicesByContractQuery,
} from "../../store/invoiceApi";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Eye, Loader2, ReceiptText } from "lucide-react";
import { formatCurrency } from "@/lib/format/currencyFormat";
import { formatDateTime } from "@/lib/format/dateTimeFormat";
import InvoiceDetailDialog from "../../components/Invoice/InvoiceDetailDialog"; // Sẽ tạo ở bước dưới
import VNPayLinkDialog from "../../components/Invoice/VNPayLinkDialog";

const InvoiceTenant = () => {
  const { t } = useTranslation("service");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // 1. Lấy thông tin hợp đồng hiện tại để có contractId
  const { data: contract, isLoading: loadingContract } =
    useGetCurrentTenantContractQuery();

  // 2. Lấy danh sách hóa đơn dựa trên ID hợp đồng
  const {
    data: invoices,
    isLoading: loadingInvoices,
    isFetching,
  } = useGetInvoicesByContractQuery(contract?.id, { skip: !contract?.id });

  const handleOpenDetail = (invoice) => {
    setSelectedInvoice(invoice);
    setIsDialogOpen(true);
  };
  // 🚨 State cho VNPay Dialog
  const [paymentUrl, setPaymentUrl] = useState("");
  const [isVNPayDialogOpen, setIsVNPayDialogOpen] = useState(false);

  // Hook tạo URL thanh toán
  const [createUrl, { isLoading: isCreatingUrl }] = useCreateVNPayUrlMutation();
  // 🚨 HÀM XỬ LÝ THANH TOÁN
  const handleProcessPayment = async (invoiceId) => {
    try {
      const result = await createUrl(invoiceId).unwrap();
      if (result?.paymentUrl) {
        setPaymentUrl(result.paymentUrl);
        setIsVNPayDialogOpen(true);
      }
    } catch (error) {
      toast.error(error?.data?.message || t("ErrorInitPayment"));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 0:
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-none">
            {t("Unpaid")}
          </Badge>
        );
      case 1:
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">
            {t("Paid")}
          </Badge>
        );
      case 2:
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none">
            {t("Overdue")}
          </Badge>
        );
      case 3:
        return (
          <Badge variant="secondary" className="border-none">
            {t("OverduePaid")}
          </Badge>
        );
      default:
        return null;
    }
  };

  if (loadingContract || loadingInvoices) {
    return (
      <div className="flex justify-center items-center min-h-100">
        <Spinner className="size-12" />
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-6 space-y-6">
      <VNPayLinkDialog
        paymentUrl={paymentUrl}
        open={isVNPayDialogOpen}
        onOpenChange={setIsVNPayDialogOpen}
      />
      <header className="flex justify-between items-center border-b pb-4">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <ReceiptText className="w-6 h-6" /> {t("MyInvoice")}
        </h1>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>
            {t("ListInvoice")} - {t("Room")} {contract?.roomName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("InvoiceCode")}</TableHead>
                <TableHead>{t("Term")}</TableHead>
                <TableHead>{t("PaymentDeadline")}</TableHead>
                <TableHead>{t("Total")}</TableHead>
                <TableHead>{t("Status")}</TableHead>
                <TableHead className="text-right">{t("Action")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices?.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {t("NoInvoice")}
                  </TableCell>
                </TableRow>
              ) : (
                invoices?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.code}</TableCell>
                    <TableCell>
                      {t("Month")} {item.month}/{item.year}
                    </TableCell>
                    <TableCell
                      className={
                        item.status === 2 ? "text-red-500 font-medium" : ""
                      }
                    >
                      {formatDateTime(item.dueDate).formattedDate}
                    </TableCell>
                    <TableCell className="font-semibold text-primary">
                      {formatCurrency(item.totalAmount)}
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      {item.status !== 1 && (
                        <Button
                          size="sm"
                          variant="default"
                          disabled={isCreatingUrl}
                          onClick={() => handleProcessPayment(item.id)}
                        >
                          {isCreatingUrl ? (
                            <Loader2 className="size-4 mr-2 animate-spin" />
                          ) : (
                            <CreditCard className="size-4 mr-2" />
                          )}
                          {t("Payment")}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDetail(item)}
                      >
                        <Eye className="size-4 mr-2" /> {t("Detail")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* DIALOG CHI TIẾT HÓA ĐƠN */}
      <InvoiceDetailDialog
        invoiceId={selectedInvoice?.id}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
};

export default InvoiceTenant;

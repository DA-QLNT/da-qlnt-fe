import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useForm, Controller } from "react-hook-form";
import { format, startOfYear, endOfYear } from "date-fns";
import { Pie, PieChart, Cell } from "recharts";
import {
  FileText,
  DollarSign,
  Clock,
  Calendar as CalendarIcon,
  Loader2,
  Eye,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useGetBillableContractsQuery } from "../../store/contractApi";
import { useGetTenantInvoiceReportMutation } from "../../store/invoiceApi";
import { formatCurrency } from "@/lib/format/currencyFormat";
import { formatDateTime } from "@/lib/format/dateTimeFormat";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import InvoiceDetailDialog from "../../components/Invoice/InvoiceDetailDialog";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent } from "@/components/ui/tooltip";
import { TooltipTrigger } from "@/components/ui/tooltip";

const PIE_COLORS = ["#10b981", "#f59e0b", "#ef4444", "#3b82f6"];
const STATUS_MAP = { 0: "Unpaid", 1: "Paid", 2: "Overdue", 3: "OverduePaid" };

const DashboardTenant = () => {
  const { t } = useTranslation("repairreportrule");
  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  }, [t]);
  const [reportData, setReportData] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);

  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // 1. Lấy danh sách hợp đồng của tenant
  const { data: billableContracts, isLoading: loadingContracts } =
    useGetBillableContractsQuery();
  const [triggerReport, { isLoading: isReportLoading }] =
    useGetTenantInvoiceReportMutation();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fromDate: startOfYear(new Date()),
      toDate: endOfYear(new Date()),
    },
  });

  // 2. Logic gọi API báo cáo
  const fetchReport = useCallback(
    async (formData, pageNum) => {
      if (!billableContracts || billableContracts.length === 0) return;

      const contractIds = billableContracts.map((c) => c.id);
      const payload = {
        contractIds,
        fromDate: format(formData.fromDate, "yyyy-MM-dd"),
        toDate: format(formData.toDate, "yyyy-MM-dd"),
        year: null,
        month: null,
        status: null,
        paymentMethod: null,
      };

      try {
        const result = await triggerReport({
          filters: payload,
          page: pageNum,
          size: pageSize,
        }).unwrap();
        setReportData(result);
      } catch (error) {
        toast.error(tRef.current("ErrorLoadData"));
      }
    },
    [billableContracts, triggerReport, pageSize]
  );

  const onSubmit = (data) => {
    setPage(0);
    fetchReport(data, 0);
  };

  useEffect(() => {
    if (billableContracts?.length > 0) {
      fetchReport(
        { fromDate: startOfYear(new Date()), toDate: endOfYear(new Date()) },
        0
      );
    }
  }, [billableContracts, fetchReport]);

  const pieChartData = useMemo(() => {
    if (!reportData?.pieChart) return [];
    return reportData.pieChart.labels
      .map((label, index) => ({
        name: label,
        value: reportData.pieChart.values[index],
        fill: PIE_COLORS[index],
      }))
      .filter((item) => item.value > 0);
  }, [reportData]);

  if (loadingContracts)
    return (
      <div className="flex justify-center py-20">
        <Spinner className="size-12 text-primary" />
      </div>
    );

  return (
    <div className="px-4 lg:px-6 py-6 space-y-6">
      <InvoiceDetailDialog
        invoiceId={selectedInvoiceId}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />

      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="text-primary" /> {t("TenantDashboard")}
        </h1>
      </div>

      {/* BỘ LỌC NGÀY THÁNG */}
      <Card>
        <CardContent className="pt-6">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-wrap items-end gap-4"
          >
            <Field className="w-full md:w-48">
              <FieldLabel>{t("FromDate")}</FieldLabel>
              <Controller
                name="fromDate"
                control={control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(field.value, "dd/MM/yyyy")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
            </Field>
            <Field className="w-full md:w-48">
              <FieldLabel>{t("ToDate")}</FieldLabel>
              <Controller
                name="toDate"
                control={control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(field.value, "dd/MM/yyyy")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
            </Field>
            <Button type="submit" disabled={isReportLoading} className="gap-2">
              {isReportLoading ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              {t("ViewReport")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {reportData ? (
        <div className="space-y-6">
          {/* TỔNG QUAN SỐ TIỀN */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-primary">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("TotalBillAmount")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(reportData.totalAmount)}
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("TotalPaid")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(
                    reportData.paidAmount + reportData.paidOverdueAmount
                  )}
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-red-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("TotalDebt")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(
                    reportData.unpaidAmount + reportData.overdueAmount
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* BIỂU ĐỒ TRÒN */}
            <Card>
              <CardHeader>
                <CardTitle>{t("InvoiceStatus")}</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ChartContainer config={{}} className="h-full w-full">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={pieChartData}
                      dataKey="value"
                      nameKey="name"
                      strokeWidth={5}
                    >
                      {pieChartData.map((_, index) => (
                        <Cell
                          key={index}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className="flex flex-wrap gap-4 justify-center">
                {pieChartData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: entry.fill }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {entry.name} ({entry.value})
                    </span>
                  </div>
                ))}
              </CardFooter>
            </Card>

            {/* CHI TIẾT THEO TRẠNG THÁI */}
            <Card>
              <CardHeader>
                <CardTitle>{t("DetailPayment")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="flex justify-between border-b pb-2">
                  <span>{t("Paid")}</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(reportData.paidAmount)}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span>{t("Unpaid")}</span>
                  <span className="font-bold text-amber-600">
                    {formatCurrency(reportData.unpaidAmount)}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span>{t("Overdue")}</span>
                  <span className="font-bold text-red-600">
                    {formatCurrency(reportData.overdueAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{t("OverduePaid")}</span>
                  <span className="font-bold text-blue-600">
                    {formatCurrency(reportData.paidOverdueAmount)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* BẢNG DANH SÁCH HÓA ĐƠN */}
          <Card>
            <CardHeader>
              <CardTitle>{t("ListInvoice")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("Term")}</TableHead>
                    <TableHead>{t("Room")}</TableHead>
                    <TableHead className="text-center">{t("Total")}</TableHead>
                    <TableHead>{t("Status")}</TableHead>
                    <TableHead>{t("PaymentDeadline")}</TableHead>
                    <TableHead className="text-center">{t("Action")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.invoices.content.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell>
                        {inv.month}/{inv.year}
                      </TableCell>
                      <TableCell className="font-medium">
                        {inv.roomCode}
                      </TableCell>
                      <TableCell className="text-center font-bold">
                        {formatCurrency(inv.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            inv.status === 1
                              ? "success"
                              : inv.overdueStatus === 2
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {t(STATUS_MAP[inv.status])}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={
                          inv.overdueStatus === 2
                            ? "text-red-500 font-medium"
                            : ""
                        }
                      >
                        {formatDateTime(inv.dueDate).formattedDate}
                      </TableCell>
                      <TableCell className="text-center">
                        <Tooltip>
                          <TooltipTrigger>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => {
                                setSelectedInvoiceId(inv.id);
                                setIsDetailOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{t("ViewDetail")}</TooltipContent>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            {/* PHÂN TRANG */}
            <CardFooter className="flex justify-between border-t py-4">
              <span className="text-sm text-muted-foreground">
                {t("Page")} {page + 1} / {reportData.invoices.totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => {
                    setPage((p) => p - 1);
                    fetchReport(watch(), page - 1);
                  }}
                >
                  {t("Previous")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={reportData.invoices.last}
                  onClick={() => {
                    setPage((p) => p + 1);
                    fetchReport(watch(), page + 1);
                  }}
                >
                  {t("Next")}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <AlertCircle size={48} className="mb-4 opacity-20" />
          <p>{t("NoData")}</p>
        </div>
      )}
    </div>
  );
};

export default DashboardTenant;

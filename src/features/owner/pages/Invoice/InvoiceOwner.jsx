import React, { useState, useEffect } from "react";
import { useAuth } from "@/features/auth";
import { useTranslation } from "react-i18next";
import {
  useSearchInvoicesQuery,
  useExportAllInvoicesMutation,
} from "../../store/serviceApi";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGetHousesByOwnerIdQuery } from "../../store/houseApi";
import { useGetRoomsByHouseIdQuery } from "../../store/roomApi";
import { format } from "date-fns";

import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import {
  ReceiptText,
  Calendar as CalendarIcon,
  Home,
  DoorOpen,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
  CreditCard,
  Clock,
  AlertCircle,
  RotateCcw,
} from "lucide-react";

import { formatCurrency } from "@/lib/format/currencyFormat";
import { formatDateTime } from "@/lib/format/dateTimeFormat";
import InvoiceDetailDialog from "../../components/Service/InvoiceDetailDialog";

const INVOICE_STATUS_LABELS = {
  0: "Unpaid",
  1: "Paid",
  2: "Overdue",
  3: "OverduePaid",
};

const PAYMENT_METHOD_OPTIONS = [
  { label: "Tiền mặt", value: "0" },
  { label: "Chuyển khoản", value: "1" },
];

const InvoiceOwner = () => {
  const { t } = useTranslation("service");
  const { userId: ownerId } = useAuth();

  // 🚨 1. KHỞI TẠO houseId LÀ NULL (BẮT BUỘC)
  const [filters, setFilters] = useState({
    houseId: null,
    roomId: "all",
    status: "all",
    paymentMethod: "all",
    fromDate: undefined,
    toDate: undefined,
    page: 0,
    size: 10,
  });

  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Lấy danh sách Nhà
  const { data: housesData } = useGetHousesByOwnerIdQuery(
    { ownerId, page: 0, size: 100 },
    { skip: !ownerId }
  );
  const allHouses = housesData?.houses || [];

  // Lấy danh sách Phòng dựa trên Nhà (Phụ thuộc)
  const { data: roomsData } = useGetRoomsByHouseIdQuery(
    { houseId: filters.houseId, page: 0, size: 200 },
    { skip: !filters.houseId || filters.houseId === "all" }
  );
  const houseRooms = roomsData?.content || [];

  // 🚨 2. GỌI API SEARCH KÈM ĐIỀU KIỆN SKIP
  const {
    data: invoiceResult,
    isLoading,
    isFetching,
    isError,
  } = useSearchInvoicesQuery(
    {
      ...filters,
      fromDate: filters.fromDate
        ? format(filters.fromDate, "yyyy-MM-dd")
        : undefined,
      toDate: filters.toDate ? format(filters.toDate, "yyyy-MM-dd") : undefined,
    },
    {
      // Chỉ gọi API khi đã chọn một ngôi nhà cụ thể
      skip: !filters.houseId || filters.houseId === "all",
    }
  );

  const invoices = invoiceResult?.content || [];
  const totalPages = invoiceResult?.totalPages || 0;

  // Reset Room & Page khi House thay đổi
  const handleHouseChange = (val) => {
    setFilters((prev) => ({ ...prev, houseId: val, roomId: "all", page: 0 }));
  };

  useEffect(() => {
    setFilters((prev) => ({ ...prev, page: 0 }));
  }, [
    filters.roomId,
    filters.status,
    filters.paymentMethod,
    filters.fromDate,
    filters.toDate,
  ]);

  const handleViewDetail = (id) => {
    setSelectedInvoiceId(id);
    setIsDetailOpen(true);
  };

  const [triggerExportAll, { isLoading: isExportingAll }] =
    useExportAllInvoicesMutation();

  const handleExportAllInvoices = async () => {
    if (!filters.houseId) {
      toast.error(t("PleaseSelectHouse"));
      return;
    }
    const toastId = toast.loading(`${t("Export")}...`);
    try {
      const defaultFromDate = new Date(0); // 1970-01-01
      const defaultToDate = new Date();

      const payload = {
        houseIds: [Number(filters.houseId)],
        roomIds: filters.roomId === "all" ? [] : [Number(filters.roomId)],
        fromDate: format(filters.fromDate || defaultFromDate, "yyyy-MM-dd"),
        toDate: format(filters.toDate || defaultToDate, "yyyy-MM-dd"),
      };

      const blobResult = await triggerExportAll(payload).unwrap();

      const excelBlob = new Blob([blobResult], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const downloadUrl = window.URL.createObjectURL(excelBlob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `DanhSach_HoaDon_${format(new Date(), "ddMMyyyy")}.xlsx`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(downloadUrl);
      toast.success(t("ExportSuccess"), { id: toastId });
    } catch (error) {
      console.error("Export All Error:", error);
      toast.error(t("ExportFailed"), { id: toastId });
    }
  };

  return (
    <div className="px-4 lg:px-6 space-y-6">
      <InvoiceDetailDialog
        invoiceId={selectedInvoiceId}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />

      <header className="flex justify-between items-center border-b pb-4">
        <h1 className="text-2xl font-bold flex items-center gap-3 text-muted-foregroundd">
          <ReceiptText className="text-primary h-7 w-7" />{" "}
          {t("InvoiceManagement")}
        </h1>
      </header>

      {/* 🚨 BỘ LỌC HÀNG NGANG */}
      <Card className="shadow-sm border-purple-100 bg-sidebar">
        <CardContent className="p-4 space-y-4 relative">
          <div className="grid grid-cols-2 md:grid-cols-4  lg:grid-cols-6 gap-2">
            {/* House - BẮT BUỘC */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase flex items-center gap-1">
                <Home size={12} /> {t("House")} (*)
              </label>
              <Select
                value={filters.houseId || ""}
                onValueChange={handleHouseChange}
              >
                <SelectTrigger
                  className={cn(
                    !filters.houseId ? "border-amber-400 bg-amber-50/30" : "",
                    "w-full"
                  )}
                >
                  <SelectValue placeholder={t("SelectHouse")} />
                </SelectTrigger>
                <SelectContent>
                  {allHouses.map((h) => (
                    <SelectItem key={h.id} value={h.id.toString()}>
                      {h.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Room */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
                <DoorOpen size={12} /> {t("Room")}
              </label>
              <Select
                value={filters.roomId}
                onValueChange={(val) =>
                  setFilters((p) => ({ ...p, roomId: val }))
                }
                disabled={!filters.houseId}
              >
                <SelectTrigger className={"w-full"}>
                  <SelectValue placeholder={t("AllRoom")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("AllRoom")}</SelectItem>
                  {houseRooms.map((r) => (
                    <SelectItem key={r.id} value={r.id.toString()}>
                      {r.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
                <Filter size={12} /> {t("Status")}
              </label>
              <Select
                value={filters.status}
                onValueChange={(val) =>
                  setFilters((p) => ({ ...p, status: val }))
                }
              >
                <SelectTrigger className={"w-full"}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("AllStatus")}</SelectItem>
                  <SelectItem value="0">{t("Unpaid")}</SelectItem>
                  <SelectItem value="1">{t("Paid")}</SelectItem>
                  <SelectItem value="2">{t("Overdue")}</SelectItem>
                  <SelectItem value="3">{t("OverduePaid")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Payment Method */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
                <CreditCard size={12} /> {t("PaymentMethod")}
              </label>
              <Select
                value={filters.paymentMethod}
                onValueChange={(val) =>
                  setFilters((p) => ({ ...p, paymentMethod: val }))
                }
              >
                <SelectTrigger className={"w-full"}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("All")}</SelectItem>
                  {PAYMENT_METHOD_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* From Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase ml-1">
                {t("FromDate")}
              </label>
              <Popover>
                <PopoverTrigger asChild className={"w-full"}>
                  <Button
                    variant="outline"
                    className="w-full justify-start font-normal h-10 px-2"
                  >
                    <CalendarIcon className="mr-1 h-4 w-4 text-slate-400" />
                    <span className="truncate">
                      {filters.fromDate
                        ? format(filters.fromDate, "dd/MM/yy")
                        : t("Start")}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.fromDate}
                    onSelect={(date) =>
                      setFilters((p) => ({ ...p, fromDate: date }))
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* To Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase ml-1">
                {t("ToDate")}
              </label>
              <Popover>
                <PopoverTrigger asChild className={"w-full"}>
                  <Button
                    variant="outline"
                    className="w-full justify-start font-normal h-10 px-2"
                  >
                    <CalendarIcon className="mr-1 h-4 w-4 text-slate-400" />
                    <span className="truncate">
                      {filters.toDate
                        ? format(filters.toDate, "dd/MM/yy")
                        : t("End")}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.toDate}
                    onSelect={(date) =>
                      setFilters((p) => ({ ...p, toDate: date }))
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Reset */}
            <div className="absolute -top-4 right-4">
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs text-red-500 h-10"
                    onClick={() =>
                      setFilters({
                        houseId: null,
                        roomId: "all",
                        status: "all",
                        paymentMethod: "all",
                        fromDate: undefined,
                        toDate: undefined,
                        page: 0,
                        size: 10,
                      })
                    }
                  >
                    <RotateCcw />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("ResetFilters")}</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardContent>
      </Card>

      {invoices && (
        <Button
          className={"flex justify-self-end"}
          onClick={handleExportAllInvoices}
          disabled={isExportingAll}
        >
          {isExportingAll && <Spinner className="mr-2 h-4 w-4" />}
          {t("ExportAllInvoices")}
        </Button>
      )}
      {/* 🚨 PHẦN HIỂN THỊ DỮ LIỆU */}
      <div className="w-full p-1 rounded-lg border border-purple-300 shadow-md bg-sidebar min-h-[300px] flex flex-col">
        {!filters.houseId ? (
          // 🚨 3. THÔNG BÁO KHI CHƯA CHỌN NHÀ
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4 py-20">
            <div className="p-4 bg-amber-100 rounded-full text-amber-500">
              <AlertCircle size={48} />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-muted-foreground">
                {t("HouseSelectionRequired")}
              </h3>
              <p className="text-sm">{t("PleaseSelectAHouseToViewInvoices")}</p>
            </div>
          </div>
        ) : isLoading || isFetching ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <Spinner className="size-12 text-primary" />
          </div>
        ) : isError ? (
          <div className="flex-1 flex items-center justify-center py-20 text-red-500">
            {t("ErrorLoadData")}
          </div>
        ) : invoices.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-20 text-slate-400 font-medium">
            {t("NoInvoice")}
          </div>
        ) : (
          <>
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[50px]">{t("No")}</TableHead>
                  <TableHead>{t("Code")}</TableHead>
                  <TableHead>{t("Room")}</TableHead>
                  <TableHead>{t("Tenant")}</TableHead>
                  <TableHead>{t("Total")}</TableHead>
                  <TableHead>{t("PaymentDeadline")}</TableHead>
                  <TableHead>{t("Status")}</TableHead>
                  <TableHead className="text-right w-[80px]">
                    {t("Action")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((item, index) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <TableCell>
                      {filters.page * filters.size + index + 1}
                    </TableCell>
                    <TableCell className="font-medium text-xs">
                      {item.code}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-primary">
                        {item.roomCode}
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase">
                        {item.year}-{item.month}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {item.tenantName}
                    </TableCell>
                    <TableCell className="font-bold text-primary">
                      {formatCurrency(item.totalAmount)}
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="flex items-center gap-1">
                        <Clock
                          size={12}
                          className={
                            item.overdueStatus === 1
                              ? "text-red-500"
                              : "text-slate-400"
                          }
                        />
                        {formatDateTime(item.dueDate).formattedDate}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.status === 1
                            ? "success"
                            : item.overdueStatus === 1
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {t(INVOICE_STATUS_LABELS[item.status])}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleViewDetail(item.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Phân trang */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center p-4 border-t bg-slate-50/30 mt-auto">
                <p className="text-xs text-slate-500 font-medium">
                  {t("Page")} {filters.page + 1} / {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setFilters((p) => ({ ...p, page: p.page - 1 }))
                    }
                    disabled={filters.page === 0}
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setFilters((p) => ({ ...p, page: p.page + 1 }))
                    }
                    disabled={filters.page >= totalPages - 1}
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default InvoiceOwner;

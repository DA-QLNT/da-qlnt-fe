import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { Pie, PieChart, Cell } from "recharts";
import {
  FileText,
  DollarSign,
  Clock,
  Calendar as CalendarIcon,
  Loader2,
  ChevronDown,
  ChevronUp,
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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetHousesByOwnerIdQuery } from "../../store/houseApi";
import { useGetInvoiceReportMutation } from "../../store/reportApi";
import { useAuth } from "@/features/auth";
import { formatCurrency } from "@/lib/format/currencyFormat";
import toast from "react-hot-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format/dateTimeFormat";

// Định nghĩa Chart Config và Colors
const PIE_COLORS = ["#10b981", "#f59e0b", "#ef4444", "#3b82f6"]; // Paid, Unpaid, Overdue, Paid Overdue
const PIE_LABELS = [
  "Đã thanh toán",
  "Chưa thanh toán",
  "Quá hạn",
  "Đã TT quá hạn",
];

const INVOICE_STATUS_SELECT = [
  { label: "Tất cả", value: null },
  { label: "Đã thanh toán", value: 1 },
  { label: "Chưa thanh toán", value: 0 },
  { label: "Quá hạn", value: 2 },
];
const PAYMENT_METHOD_SELECT = [
  { label: "Tất cả", value: null },
  { label: "Tiền mặt", value: 0 },
  { label: "Chuyển khoản", value: 1 },
];
const OVERDUE_STATUS_MAP = {
  0: "Bình thường",
  1: "Sắp quá hạn",
  2: "Đã quá hạn",
};
const STATUS_MAP = { 0: "Chưa TT", 1: "Đã TT", 2: "Quá hạn" };

const defaultFilter = {
  houseIds: [],
  fromDate: startOfMonth(subMonths(new Date(), 2)),
  toDate: endOfMonth(new Date()),
  status: null,
  paymentMethod: null,
  roomIds: [], // Không dùng ở đây nhưng cần trong body API
  month: null, // Không dùng ở đây
  year: null, // Không dùng ở đây
};

const InvoiceReportTab = () => {
  const { userId: ownerId } = useAuth();

  const [reportData, setReportData] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [triggerReport, { isLoading: isReportLoading }] =
    useGetInvoiceReportMutation();
  const [currentFilters, setCurrentFilters] = useState(defaultFilter); // Lưu trữ filter đã submit

  // Sắp xếp bảng
  const [sortConfig, setSortConfig] = useState({
    key: "totalAmount",
    direction: "desc",
  });

  // Fetch danh sách nhà
  const { data: housesData, isLoading: loadingHouses } =
    useGetHousesByOwnerIdQuery(
      { ownerId, page: 0, size: 100 },
      { skip: !ownerId }
    );
  const allHouses = housesData?.houses || [];

  // RHF Setup
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: defaultFilter,
  });

  const watchHouseIds = watch("houseIds");

  // LOGIC CHUYỂN ĐỔI DỮ LIỆU PIE CHART
  const pieChartData = useMemo(() => {
    if (!reportData || !reportData.pieChart) return [];

    return reportData.pieChart.values
      .map((value, index) => ({
        name: PIE_LABELS[index],
        value: value,
        fill: PIE_COLORS[index],
      }))
      .filter((item) => item.value > 0);
  }, [reportData]);

  // 🚨 LOGIC GỌI API BÁO CÁO
  const fetchReport = useCallback(
    async (filters, pageNum, pageSizeNum) => {
      const payload = {
        houseIds: filters.houseIds,
        fromDate: format(filters.fromDate, "yyyy-MM-dd"),
        toDate: format(filters.toDate, "yyyy-MM-dd"),
        status: filters.status,
        paymentMethod: filters.paymentMethod,
        roomIds: filters.roomIds,
        month: filters.month,
        year: filters.year,
      };

      try {
        const result = await triggerReport({
          filters: payload,
          page: pageNum,
          size: pageSizeNum,
        }).unwrap();
        setReportData(result);
      } catch (error) {
        toast.error(error.data?.message || "Lỗi tải báo cáo hóa đơn.");
        setReportData(null);
      }
    },
    [triggerReport]
  );

  // HÀM SUBMIT FORM LỌC
  const onSubmitFilters = (data) => {
    if (data.houseIds.length === 0) {
      return toast.error("Vui lòng chọn ít nhất một Nhà trọ.");
    }
    setCurrentFilters(data);
    setPage(0); // Reset về trang đầu tiên khi lọc mới
    fetchReport(data, 0, pageSize);
  };

  // Xử lý thay đổi trang
  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchReport(currentFilters, newPage, pageSize);
  };

  // Logic sắp xếp (chỉ áp dụng client side cho dữ liệu hiện tại)
  const sortedInvoices = useMemo(() => {
    if (!reportData || !reportData.invoices?.content) return [];

    const sortableItems = [...reportData.invoices.content];
    sortableItems.sort((a, b) => {
      const keys = sortConfig.key.split(".");
      let aValue = a[keys[0]];
      let bValue = b[keys[0]];

      if (sortConfig.key === "roomCode") {
        // Sắp xếp string mã phòng
        return sortConfig.direction === "asc"
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      } else {
        // Sắp xếp số tiền
        aValue = a[sortConfig.key] || 0;
        bValue = b[sortConfig.key] || 0;
      }

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
    return sortableItems;
  }, [reportData, sortConfig]);

  const requestSort = (key) => {
    let direction = "desc";
    if (sortConfig.key === key && sortConfig.direction === "desc") {
      direction = "asc";
    }
    setSortConfig({ key, direction });
  };

  // Chạy báo cáo lần đầu tiên
  useEffect(() => {
    if (ownerId && allHouses.length > 0 && !reportData) {
      const defaultHouseIds = allHouses.map((h) => h.id);
      const initialFilters = { ...defaultFilter, houseIds: defaultHouseIds };
      setCurrentFilters(initialFilters);
      fetchReport(initialFilters, 0, pageSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerId, allHouses.length]);

  // Hàm render MultiSelect (Popover + Checkbox) (Giữ nguyên)
  const renderHouseMultiSelect = (field) => {
    const selectedCount = field.value.length;
    const allSelected =
      allHouses.length > 0 && selectedCount === allHouses.length;
    const displayText =
      selectedCount === 0
        ? "Chọn Nhà trọ..."
        : allSelected
        ? "Tất cả Nhà trọ"
        : `${selectedCount} Nhà đã chọn`;

    const toggleHouse = (houseId, isChecked) => {
      const newIds = isChecked
        ? [...field.value, houseId]
        : field.value.filter((id) => id !== houseId);
      field.onChange(newIds);
    };

    const toggleAll = (isChecked) => {
      const newIds = isChecked ? allHouses.map((h) => h.id) : [];
      field.onChange(newIds);
    };

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start overflow-hidden"
            disabled={loadingHouses || isReportLoading}
          >
            {loadingHouses ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              displayText
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <ScrollArea className="h-[200px]">
            <div className="p-1">
              <div
                className="flex items-center space-x-2 p-2 border-b cursor-pointer hover:bg-muted"
                onClick={() => toggleAll(!allSelected)}
              >
                <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                <span className="font-semibold text-sm">
                  Chọn tất cả ({allHouses.length})
                </span>
              </div>
              {allHouses.map((house) => {
                const isChecked = field.value.includes(house.id);
                return (
                  <div
                    key={house.id}
                    className="flex items-center space-x-2 p-2 cursor-pointer hover:bg-muted"
                    onClick={() => toggleHouse(house.id, !isChecked)}
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={(c) => toggleHouse(house.id, c)}
                    />
                    <span className="text-sm">{house.name}</span>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <div className="space-y-6">
      {/* --------------------- 1. FORM LỌC --------------------- */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc Hóa đơn</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmitFilters)} className="space-y-4">
            <FieldGroup className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {/* House Select (Multi) */}
              <Field className="md:col-span-1">
                <FieldLabel>Chọn Nhà trọ</FieldLabel>
                <Controller
                  name="houseIds"
                  control={control}
                  render={({ field }) => renderHouseMultiSelect(field)}
                />
                <FieldError>{errors.houseIds?.message}</FieldError>
              </Field>

              {/* From Date */}
              <Field className="md:col-span-1">
                <FieldLabel>Từ ngày</FieldLabel>
                <Controller
                  name="fromDate"
                  control={control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn("w-full justify-start text-left")}
                          disabled={isReportLoading}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value
                            ? format(field.value, "dd/MM/yyyy")
                            : "Chọn ngày"}
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
                <FieldError>{errors.fromDate?.message}</FieldError>
              </Field>

              {/* To Date */}
              <Field className="md:col-span-1">
                <FieldLabel>Đến ngày</FieldLabel>
                <Controller
                  name="toDate"
                  control={control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn("w-full justify-start text-left")}
                          disabled={isReportLoading}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value
                            ? format(field.value, "dd/MM/yyyy")
                            : "Chọn ngày"}
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
                <FieldError>{errors.toDate?.message}</FieldError>
              </Field>

              {/* Status Select */}
              <Field className="md:col-span-1">
                <FieldLabel>Trạng thái TT</FieldLabel>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={(val) =>
                        field.onChange(val === "null" ? null : Number(val))
                      }
                      value={
                        field.value === null ? "null" : field.value.toString()
                      }
                      disabled={isReportLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        {INVOICE_STATUS_SELECT.map((option) => (
                          <SelectItem
                            key={option.label}
                            value={
                              option.value === null
                                ? "null"
                                : option.value.toString()
                            }
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              {/* Payment Method Select */}
              <Field className="md:col-span-1">
                <FieldLabel>P.Thức TT</FieldLabel>
                <Controller
                  name="paymentMethod"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={(val) =>
                        field.onChange(val === "null" ? null : Number(val))
                      }
                      value={
                        field.value === null ? "null" : field.value.toString()
                      }
                      disabled={isReportLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn phương thức" />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_METHOD_SELECT.map((option) => (
                          <SelectItem
                            key={option.label}
                            value={
                              option.value === null
                                ? "null"
                                : option.value.toString()
                            }
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            </FieldGroup>
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={isReportLoading || watchHouseIds.length === 0}
              >
                {isReportLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                Xem Báo cáo
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* --------------------- 2. HIỂN THỊ TỔNG QUAN VÀ PIE CHART --------------------- */}
      {isReportLoading && !reportData ? (
        <div className="text-center py-10">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        </div>
      ) : reportData ? (
        <div className="space-y-6">
          <h3 className="text-xl font-bold">Tổng quan Hóa đơn</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Tổng Hóa đơn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reportData.totalInvoices}
                </div>
              </CardContent>
            </Card>
            {/* <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tổng Thu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-green-600">
                  {formatCurrency(reportData.totalPaid)}
                </div>
              </CardContent>
            </Card> */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Tổng Công nợ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-red-600">
                  {formatCurrency(
                    reportData.unpaidAmount + reportData.overdueAmount
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Hóa đơn Quá hạn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-red-700">
                  {reportData.overdueCount}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tổng Tiền</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">
                  {formatCurrency(reportData.totalAmount)}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Biểu đồ tròn */}
            <Card>
              <CardHeader>
                <CardTitle>Phân bổ Trạng thái Hóa đơn</CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                {pieChartData.length > 0 ? (
                  <ChartContainer config={{}} className="h-full">
                    <PieChart>
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            nameKey="name"
                            valueFormatter={(value) => formatCurrency(value)}
                          />
                        }
                      />
                      <Pie data={pieChartData} dataKey="value" nameKey="name">
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                ) : (
                  <div className="text-center text-muted-foreground py-10">
                    Không có hóa đơn nào trong khoảng thời gian này.
                  </div>
                )}
              </CardContent>
              {/* 🚨 PHẦN CHÚ THÍCH MÀU */}
              <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {pieChartData.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-1">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: entry.fill }}
                      ></span>
                      <span className="text-xs text-muted-foreground">
                        {entry.name} ({entry.value})
                      </span>
                    </div>
                  ))}
                </div>
              </CardFooter>
            </Card>

            {/* Chi tiết thanh toán */}
            <Card>
              <CardHeader>
                <CardTitle>Chi tiết Thanh toán</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium">
                    Đã thanh toán ({reportData.paidCount})
                  </span>{" "}
                  <span className="font-bold text-green-600">
                    {formatCurrency(reportData.paidAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium">
                    Chưa thanh toán ({reportData.unpaidCount})
                  </span>{" "}
                  <span className="font-bold text-red-600">
                    {formatCurrency(reportData.unpaidAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium">
                    Quá hạn ({reportData.overdueCount})
                  </span>{" "}
                  <span className="font-bold text-red-700">
                    {formatCurrency(reportData.overdueAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium">
                    Đã TT Quá hạn ({reportData.paidOverdueCount})
                  </span>{" "}
                  <span className="font-bold text-blue-600">
                    {formatCurrency(reportData.paidOverdueAmount)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* --------------------- 3. DANH SÁCH HÓA ĐƠN (BẢNG) --------------------- */}
          <h3 className="text-xl font-bold pt-4">Danh sách Hóa đơn</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Kỳ</TableHead>
                <TableHead>Mã HĐ / Phòng</TableHead>
                <TableHead>Khách thuê</TableHead>
                <TableHead className="text-right">
                  <span
                    onClick={() => requestSort("rentAmount")}
                    className="cursor-pointer select-none flex items-center justify-end"
                  >
                    Tiền Phòng
                    {sortConfig.key === "rentAmount" &&
                      (sortConfig.direction === "asc" ? (
                        <ChevronUp className="h-3 w-3 ml-1" />
                      ) : (
                        <ChevronDown className="h-3 w-3 ml-1" />
                      ))}
                  </span>
                </TableHead>
                <TableHead className="text-right">
                  <span
                    onClick={() => requestSort("serviceAmount")}
                    className="cursor-pointer select-none flex items-center justify-end"
                  >
                    Tiền DV
                    {sortConfig.key === "serviceAmount" &&
                      (sortConfig.direction === "asc" ? (
                        <ChevronUp className="h-3 w-3 ml-1" />
                      ) : (
                        <ChevronDown className="h-3 w-3 ml-1" />
                      ))}
                  </span>
                </TableHead>
                <TableHead className="text-right">
                  <span
                    onClick={() => requestSort("totalAmount")}
                    className="cursor-pointer select-none flex items-center justify-end"
                  >
                    Tổng tiền
                    {sortConfig.key === "totalAmount" &&
                      (sortConfig.direction === "asc" ? (
                        <ChevronUp className="h-3 w-3 ml-1" />
                      ) : (
                        <ChevronDown className="h-3 w-3 ml-1" />
                      ))}
                  </span>
                </TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Hạn TT</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>
                    {invoice.month}/{invoice.year}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{invoice.code}</span> /{" "}
                    {invoice.roomCode}
                  </TableCell>
                  <TableCell>{invoice.tenantName}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(invoice.rentAmount)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(invoice.serviceAmount)}
                  </TableCell>
                  <TableCell className="text-right font-bold text-primary">
                    {formatCurrency(invoice.totalAmount)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        invoice.status === 1
                          ? "success"
                          : invoice.overdueStatus === 2
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {STATUS_MAP[invoice.status]}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className={
                      invoice.overdueStatus === 2
                        ? "text-red-500 font-medium"
                        : ""
                    }
                  >
                    {formatDateTime(invoice.dueDate).formattedDate}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination (Tạm thời bỏ qua component pagination chi tiết) */}
          <CardFooter className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 0 || isReportLoading}
            >
              Trang trước
            </Button>
            <Button
              variant="outline"
              onClick={() => handlePageChange(page + 1)}
              disabled={reportData.invoices.last || isReportLoading}
            >
              Trang sau
            </Button>
          </CardFooter>
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-10">
          Vui lòng chọn bộ lọc và xem báo cáo.
        </p>
      )}
    </div>
  );
};

export default InvoiceReportTab;

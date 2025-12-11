import React, { useState, useMemo, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  TrendingUp,
  FileText,
  DollarSign,
  Bed,
  Calendar as CalendarIcon,
  Loader2,
  Check,
} from "lucide-react"; // Import Check
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { FieldGroup } from "@/components/ui/field";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useGetHousesByOwnerIdQuery } from "../../store/houseApi";
import { useGetRevenueReportMutation } from "../../store/reportApi";
import { useAuth } from "@/features/auth";
import { formatCurrency } from "@/lib/format/currencyFormat";
import toast from "react-hot-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

// Định nghĩa Chart Config
const chartConfig = {
  revenue: {
    label: "Doanh thu (VNĐ)",
    color: "var(--chart-2)",
  },
};

const defaultFilter = {
  fromDate: startOfMonth(subMonths(new Date(), 2)),
  toDate: endOfMonth(new Date()),
  houseIds: [],
};

const RevenueReportTab = () => {
  const { userId: ownerId } = useAuth();

  const [reportData, setReportData] = useState(null);
  const [triggerReport, { isLoading: isReportLoading }] =
    useGetRevenueReportMutation();

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
    formState: { errors },
  } = useForm({
    defaultValues: defaultFilter,
  });

  const watchHouseIds = watch("houseIds");

  // LOGIC CHUYỂN ĐỔI DỮ LIỆU CHART
  const revenueChartData = useMemo(() => {
    if (!reportData || !reportData.revenueMonthChart) return [];

    return reportData.revenueMonthChart.map((item) => ({
      month: format(new Date(item.month), "MM/yyyy"),
      revenue: item.amount,
    }));
  }, [reportData]);

  // 🚨 HÀM SUBMIT FORM LỌC
  const onSubmit = async (data) => {
    if (data.houseIds.length === 0) {
      return toast.error("Vui lòng chọn ít nhất một Nhà trọ.");
    }
    const payload = {
      houseIds: data.houseIds, // API mong đợi list number
      fromDate: format(data.fromDate, "yyyy-MM-dd"),
      toDate: format(data.toDate, "yyyy-MM-dd"),
    };

    try {
      const result = await triggerReport(payload).unwrap();
      setReportData(result);
      toast.success("Đã tải báo cáo doanh thu mới.");
    } catch (error) {
      toast.error(error.data?.message || "Lỗi tải báo cáo.");
      setReportData(null);
    }
  };

  // Chạy báo cáo lần đầu tiên khi component mount
  useEffect(() => {
    if (ownerId && allHouses.length > 0 && !reportData) {
      const defaultHouseIds = allHouses.map((h) => h.id);

      setValue("houseIds", defaultHouseIds);
      handleSubmit(onSubmit)();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerId, allHouses.length]);

  // Hàm render MultiSelect (Popover + Checkbox)
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
              {/* Option Chọn tất cả */}
              <div
                className="flex items-center space-x-2 p-2 border-b cursor-pointer hover:bg-muted"
                onClick={() => toggleAll(!allSelected)}
              >
                <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                <span className="font-semibold text-sm">
                  Chọn tất cả ({allHouses.length})
                </span>
              </div>

              {/* Danh sách từng nhà */}
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
              {allHouses.length === 0 && (
                <p className="text-center text-xs text-muted-foreground py-4">
                  Không tìm thấy nhà trọ.
                </p>
              )}
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
          <CardTitle>Bộ lọc Báo cáo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FieldGroup className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* House Select (Multi) */}
              <Field>
                <FieldLabel>Chọn Nhà trọ</FieldLabel>
                <Controller
                  name="houseIds"
                  control={control}
                  render={
                    ({ field }) => renderHouseMultiSelect(field) // 🚨 Dùng component tùy chỉnh
                  }
                />
              </Field>

              {/* From Date */}
              <Field>
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
              <Field>
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

      {/* --------------------- 2. HIỂN THỊ CHỈ SỐ TỔNG QUAN --------------------- */}
      {isReportLoading && !reportData ? (
        <div className="text-center py-10">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        </div>
      ) : reportData ? (
        <div className="space-y-6">
          <h3 className="text-xl font-bold">Tổng quan Doanh thu</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* ... (Cards tổng quan giữ nguyên) */}
            <Card className={" overflow-auto"}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tổng Doanh thu
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(reportData.totalRevenue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Đã thu: {formatCurrency(reportData.totalPaid)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tổng Công nợ
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(reportData.totalDebt)}
                </div>
                <p className="text-xs text-muted-foreground">Cần phải thu</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tỷ lệ lấp đầy phòng
                </CardTitle>
                <Bed className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reportData.occupancyRate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {reportData.totalRoomsOccupied} / {reportData.totalRooms}{" "}
                  phòng
                </p>
              </CardContent>
            </Card>
          </div>

          {/* --------------------- 3. BIỂU ĐỒ DOANH THU --------------------- */}
          <Card>
            <CardHeader>
              <CardTitle>Biểu đồ Doanh thu</CardTitle>
              <CardDescription>
                Doanh thu đã thu theo tháng (Tổng công nợ chưa hiển thị)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={chartConfig}
                className="max-h-[300px] w-full"
              >
                <BarChart
                  accessibilityLayer
                  data={revenueChartData}
                  margin={{ top: 20 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        indicator="dashed"
                        valueFormatter={(value) => formatCurrency(value)}
                      />
                    }
                  />
                  <Bar
                    dataKey="revenue"
                    fill="var(--color-chart-2)"
                    radius={4}
                    barSize={30}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
              <div className="flex gap-2 leading-none font-medium text-green-600">
                Tổng doanh thu: {formatCurrency(reportData.totalRevenue)}
              </div>
            </CardFooter>
          </Card>

          {/* --------------------- 4. CHI TIẾT THEO NHÀ --------------------- */}
          <h3 className="text-xl font-bold pt-4">Chi tiết theo Nhà trọ</h3>
          {/* 🚨 TÍCH HỢP BẢNG CHI TIẾT TẠI ĐÂY */}
          {/* ... */}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-10">
          Vui lòng chọn nhà trọ và khoảng thời gian để xem báo cáo.
        </p>
      )}
    </div>
  );
};

export default RevenueReportTab;

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Bed,
  Home,
  TrendingUp,
  Loader2,
  Maximize2,
  FileText,
  ChevronDown,
  ChevronUp,
  ArrowDownAZ,
  ArrowDownZA,
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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { useGetHousesByOwnerIdQuery } from "../../store/houseApi";
import { useGetRoomReportMutation } from "../../store/reportApi"; // Mutation báo cáo
import { useAuth } from "@/features/auth";
import toast from "react-hot-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/format/currencyFormat"; // Để format giá (nếu có)
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTranslation } from "react-i18next";

// Định nghĩa Chart Config cho biểu đồ Bar Chart Nhóm
const roomChartConfig = {
  occupied: {
    label: "Đang thuê",
    color: "hsl(var(--primary))",
  },
  vacant: {
    label: "Còn trống",
    color: "hsl(var(--muted-foreground))",
  },
};

const defaultFilter = {
  houseIds: [],
};

const RoomReportTab = () => {
  const { t } = useTranslation("repairreportrule");

  const { userId: ownerId } = useAuth();

  const [reportData, setReportData] = useState(null);
  const [triggerReport, { isLoading: isReportLoading }] =
    useGetRoomReportMutation();
  // sort occupancyRate
  const [sortConfig, setSortConfig] = useState({
    key: "occupancyRate",
    direction: "desc",
  });
  //  LOGIC SẮP XẾP BẢNG
  const sortedDetails = useMemo(() => {
    if (!reportData || !reportData.houseRoomDetails) return [];
    const sortableItems = [...reportData.houseRoomDetails];
    sortableItems.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
    return sortableItems;
  }, [reportData, sortConfig]); //  HÀM THAY ĐỔI CẤU HÌNH SẮP XẾP

  const requestSort = (key) => {
    let direction = "desc";
    if (sortConfig.key === key && sortConfig.direction === "desc") {
      direction = "asc";
    }
    setSortConfig({ key, direction });
  };
  const { data: housesData, isLoading: loadingHouses } =
    useGetHousesByOwnerIdQuery(
      { ownerId, page: 0, size: 100 },
      { skip: !ownerId }
    );
  const allHouses = housesData?.houses || [];

  // RHF Setup
  const { control, handleSubmit, watch, setValue } = useForm({
    defaultValues: defaultFilter,
  });

  const watchHouseIds = watch("houseIds");

  // LOGIC CHUYỂN ĐỔI DỮ LIỆU CHART
  const roomChartData = useMemo(() => {
    if (!reportData || !reportData.roomStatusChart) return [];

    // Dữ liệu API đã chuẩn: [{ houseName, occupied, vacant }]
    return reportData.roomStatusChart.map((item) => ({
      name: item.houseName,
      occupied: item.occupied,
      vacant: item.vacant,
    }));
  }, [reportData]);

  //  HÀM SUBMIT FORM LỌC
  const onSubmit = async (data) => {
    if (data.houseIds.length === 0) {
      return toast.error(t("PleaseSelectHouse"));
    }
    const payload = {
      houseIds: data.houseIds, // List ID
    };

    try {
      const result = await triggerReport(payload).unwrap();
      setReportData(result);
      toast.success(t("ExportSuccess"));
    } catch (error) {
      toast.error(t("ExportFailed"));
      setReportData(null);
    }
  };

  // Chạy báo cáo lần đầu tiên khi component mount (dùng filters mặc định)
  useEffect(() => {
    if (ownerId && allHouses.length > 0 && !reportData) {
      const defaultHouseIds = allHouses.map((h) => h.id);

      setValue("houseIds", defaultHouseIds);
      handleSubmit(onSubmit)();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerId, allHouses.length]);

  // Hàm render MultiSelect (Tái sử dụng logic từ RevenueTab)
  const renderHouseMultiSelect = (field) => {
    const selectedCount = field.value.length;
    const allSelected =
      allHouses.length > 0 && selectedCount === allHouses.length;
    const displayText =
      selectedCount === 0
        ? t("SelectHouse")
        : allSelected
        ? t("AllHouse")
        : `${selectedCount} ${t("SelectedHouse")}`;

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
                  {t("SelectAll")} ({allHouses.length})
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
                  {t("NoHouse")}
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
      <Card className={"w-full sm:max-w-xl"}>
        <CardHeader>
          <CardTitle>{t("FilterRoom")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FieldGroup className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* House Select (Multi) */}
              <Field className="md:col-span-3">
                <FieldLabel>{t("SelectHouse")}</FieldLabel>
                <Controller
                  name="houseIds"
                  control={control}
                  render={({ field }) => renderHouseMultiSelect(field)}
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
                {t("ViewReport")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* --------------------- 2. HIỂN THỊ CHỈ SỐ TỔNG QUAN & BIỂU ĐỒ --------------------- */}
      {isReportLoading && !reportData ? (
        <div className="text-center py-10">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        </div>
      ) : reportData ? (
        <div className="space-y-6">
          <h3 className="text-xl font-bold">{t("GeneralRoom")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("TotalRoom")}
                </CardTitle>
                <Bed className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reportData.totalRooms}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("Rent")}
                </CardTitle>
                <Home className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {reportData.totalRoomsOccupied}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("Available")}
                </CardTitle>
                <Home className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {reportData.vacantRooms}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("RoomOccupancy")}
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reportData.occupancyRate.toFixed(1)}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* --------------------- 3. BIỂU ĐỒ TRẠNG THÁI PHÒNG (GROUPED BAR CHART) --------------------- */}
          <Card>
            <CardHeader>
              <CardTitle>
                {t("Room")} {t("Rent")} & {t("Available")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={roomChartConfig}
                className="max-h-[300px] w-full"
              >
                <BarChart
                  accessibilityLayer
                  data={roomChartData}
                  margin={{ top: 20 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="name" // Tên nhà
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <YAxis />
                  <ChartTooltip
                    cursor={{ fill: "var(--muted)", opacity: 0.5 }}
                    content={<ChartTooltipContent indicator="dashed" />}
                  />
                  {/* Bar Đang thuê */}
                  <Bar
                    dataKey="occupied"
                    fill="var(--color-chart-2)"
                    radius={4}
                    barSize={30}
                  />
                  {/* Bar Phòng trống */}
                  <Bar
                    dataKey="vacant"
                    fill="var(--color-destructive)"
                    radius={4}
                    barSize={30}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* --------------------- 4. CHI TIẾT THEO NHÀ (Bảng) --------------------- */}
          <h3 className="text-xl font-bold pt-4">{t("DetailRoomOccupancy")}</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("House")}</TableHead>
                <TableHead>{t("TotalRoom")}</TableHead>
                <TableHead>{t("Rent")}</TableHead>
                <TableHead>{t("Available")}</TableHead>
                <TableHead
                  className="text-right cursor-pointer select-none group flex items-center justify-end"
                  onClick={() => requestSort("occupancyRate")} //  Kích hoạt sắp xếp
                >
                  {t("RoomOccupancy")}
                  {sortConfig.key === "occupancyRate" ? (
                    sortConfig.direction === "asc" ? (
                      <ArrowDownZA className="h-4 w-4 ml-1" />
                    ) : (
                      <ArrowDownAZ className="h-4 w-4 ml-1" />
                    )
                  ) : (
                    <ArrowDownAZ className="h-4 w-4 ml-1 text-muted opacity-50 group-hover:opacity-100" />
                  )}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedDetails.map((house, index) => (
                <TableRow key={house.houseId}>
                  <TableCell className="font-medium">
                    {house.houseName}
                  </TableCell>
                  <TableCell>{house.totalRooms}</TableCell>
                  <TableCell className="text-green-600 font-semibold">
                    {house.totalRoomsOccupied}
                  </TableCell>
                  <TableCell className="text-red-600 font-semibold">
                    {house.vacantRooms}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {house.occupancyRate.toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-10">
          {t("PleaseSelectHouse")}
        </p>
      )}
    </div>
  );
};

export default RoomReportTab;

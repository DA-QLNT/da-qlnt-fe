import React, { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/features/auth";
import { useGetHousesByOwnerIdQuery } from "../../store/houseApi";
import { useGetOwnerDashboardStatsMutation } from "../../store/reportApi";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { Pie, PieChart, LabelList } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Home,
  LayoutDashboard,
  Loader2,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

// Màu sắc cho từng nhóm biểu đồ
const ROOM_COLORS = ["#10b981", "#f59e0b"]; // Đang thuê, Trống
const CONTRACT_COLORS = ["#3b82f6", "#6366f1"]; // Chờ kích hoạt, Hiệu lực
const REPAIR_COLORS = ["#ef4444", "#64748b"]; // Mới, Đang sửa

const DashboardOwner = () => {
  const { t } = useTranslation("repairreportrule");
  const { userId: ownerId } = useAuth();

  const [stats, setStats] = useState(null);
  const [triggerDashboard, { isLoading: isReportLoading }] =
    useGetOwnerDashboardStatsMutation();

  const { data: housesData, isLoading: loadingHouses } =
    useGetHousesByOwnerIdQuery(
      { ownerId, page: 0, size: 100 },
      { skip: !ownerId }
    );
  const allHouses = housesData?.houses || [];

  const { control, handleSubmit, setValue, watch } = useForm({
    defaultValues: { houseIds: [] },
  });

  const watchHouseIds = watch("houseIds");

  const onSubmit = async (data) => {
    if (data.houseIds.length === 0) return;
    try {
      const result = await triggerDashboard(data.houseIds).unwrap();
      setStats(result);
    } catch (error) {
      console.error("Dashboard error:", error);
    }
  };

  useEffect(() => {
    if (allHouses.length > 0 && !stats) {
      const ids = allHouses.map((h) => h.id);
      setValue("houseIds", ids);
      triggerDashboard(ids).then((res) => setStats(res.data));
    }
  }, [allHouses]);

  // 1. DỮ LIỆU PHÒNG
  const roomChartData = useMemo(() => {
    if (!stats) return [];
    return [
      {
        name: t("Occupied"),
        value: stats.totalRoomsOccupied,
        fill: ROOM_COLORS[0],
      },
      { name: t("Vacant"), value: stats.vacantRooms, fill: ROOM_COLORS[1] },
    ].filter((i) => i.value > 0);
  }, [stats, t]);

  // 2. DỮ LIỆU HỢP ĐỒNG
  const contractChartData = useMemo(() => {
    if (!stats) return [];
    return [
      {
        name: t("WaitingActivate"),
        value: stats.waitingOwnerConfirmContracts,
        fill: CONTRACT_COLORS[0],
      },
      {
        name: t("ActiveContracts"),
        value: stats.activeContracts,
        fill: CONTRACT_COLORS[1],
      },
    ].filter((i) => i.value > 0);
  }, [stats, t]);

  // 3. DỮ LIỆU SỬA CHỮA
  const repairChartData = useMemo(() => {
    if (!stats) return [];
    return [
      {
        name: t("NewRepair"),
        value: stats.newRepairRequests,
        fill: REPAIR_COLORS[0],
      },
      {
        name: t("ProcessingRepair"),
        value: stats.processingRepairRequests,
        fill: REPAIR_COLORS[1],
      },
    ].filter((i) => i.value > 0);
  }, [stats, t]);

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

    const toggleHouse = (id, checked) => {
      const newIds = checked
        ? [...field.value, id]
        : field.value.filter((i) => i !== id);
      field.onChange(newIds);
    };

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-[250px] justify-start truncate"
          >
            <Home className="mr-2 h-4 w-4 text-primary" />
            {loadingHouses ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
              displayText
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0" align="start">
          <ScrollArea className="h-[200px]">
            <div className="p-2 space-y-1">
              <div
                className="flex items-center space-x-2 p-2 border-b cursor-pointer hover:bg-muted"
                onClick={() =>
                  field.onChange(allSelected ? [] : allHouses.map((h) => h.id))
                }
              >
                <Checkbox checked={allSelected} />
                <span className="text-sm font-bold">{t("SelectAll")}</span>
              </div>
              {allHouses.map((house) => (
                <div
                  key={house.id}
                  className="flex items-center space-x-2 p-2 cursor-pointer hover:bg-muted"
                  onClick={() =>
                    toggleHouse(house.id, !field.value.includes(house.id))
                  }
                >
                  <Checkbox checked={field.value.includes(house.id)} />
                  <span className="text-sm">{house.name}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <div className="px-4 lg:px-6 py-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
            <LayoutDashboard /> {t("OwnerDashboard")}
          </h1>
          <p className="text-sm text-muted-foreground italic">
            {t("BusinessOverview")}
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex items-center gap-2"
        >
          <Controller
            name="houseIds"
            control={control}
            render={({ field }) => renderHouseMultiSelect(field)}
          />
          <Button
            type="submit"
            disabled={isReportLoading || watchHouseIds.length === 0}
          >
            {isReportLoading ? (
              <Loader2 className="animate-spin text-white" />
            ) : (
              t("Update")
            )}
          </Button>
        </form>
      </div>

      {isReportLoading && !stats ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner className="size-12 text-primary" />
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* BIỂU ĐỒ 1: TÌNH TRẠNG PHÒNG */}
          <Card className="flex flex-col shadow-sm">
            <CardHeader className="items-center pb-2">
              <CardTitle className="text-lg">{t("RoomStatusChart")}</CardTitle>
              <CardDescription>
                {t("TotalRooms")}: {stats.totalRooms}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <ChartContainer
                config={{}}
                className="mx-auto aspect-square max-h-[220px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={roomChartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    strokeWidth={5}
                  >
                    <LabelList
                      dataKey="value"
                      className="fill-white font-bold"
                      stroke="none"
                      fontSize={12}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-3 text-sm pt-4">
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
                {roomChartData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: entry.fill }}
                    ></span>
                    <span className="text-xs text-muted-foreground">
                      {entry.name}: <b>{entry.value}</b>
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 font-medium text-green-600 border-t w-full justify-center pt-2">
                <TrendingUp className="h-4 w-4" /> {t("OccupancyRate")}:{" "}
                {((stats.totalRoomsOccupied / stats.totalRooms) * 100).toFixed(
                  1
                )}
                %
              </div>
            </CardFooter>
          </Card>

          {/* BIỂU ĐỒ 2: HỢP ĐỒNG */}
          <Card className="flex flex-col shadow-sm border-blue-100">
            <CardHeader className="items-center pb-2">
              <CardTitle className="text-lg">{t("Contract")}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <ChartContainer
                config={{}}
                className="mx-auto aspect-square max-h-[220px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={contractChartData}
                    dataKey="value"
                    nameKey="name"
                    strokeWidth={5}
                  >
                    <LabelList
                      dataKey="value"
                      className="fill-white font-bold"
                      stroke="none"
                      fontSize={12}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-3 text-sm pt-4">
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
                {contractChartData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: entry.fill }}
                    ></span>
                    <span className="text-xs text-muted-foreground">
                      {entry.name}: <b>{entry.value}</b>
                    </span>
                  </div>
                ))}
              </div>
              {contractChartData.length === 0 && (
                <p className="text-slate-400 italic pt-2">{t("NoContract")}</p>
              )}
            </CardFooter>
          </Card>

          {/* BIỂU ĐỒ 3: SỬA CHỮA */}
          <Card className="flex flex-col shadow-sm border-red-100">
            <CardHeader className="items-center pb-2">
              <CardTitle className="text-lg">{t("Repair")}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <ChartContainer
                config={{}}
                className="mx-auto aspect-square max-h-[220px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={repairChartData}
                    dataKey="value"
                    nameKey="name"
                    strokeWidth={5}
                  >
                    <LabelList
                      dataKey="value"
                      className="fill-white font-bold"
                      stroke="none"
                      fontSize={12}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-3 text-sm pt-4">
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
                {repairChartData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: entry.fill }}
                    ></span>
                    <span className="text-xs text-muted-foreground">
                      {entry.name}: <b>{entry.value}</b>
                    </span>
                  </div>
                ))}
              </div>
              {repairChartData.length === 0 && (
                <p className="text-slate-400 italic pt-2">
                  {t("NoRepairRequests")}
                </p>
              )}
            </CardFooter>
          </Card>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <AlertCircle size={48} className="mb-2 opacity-20" />
          <p>{t("PleaseSelectHouse")}</p>
        </div>
      )}
    </div>
  );
};

export default DashboardOwner;

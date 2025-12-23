import React from "react";
import { useTranslation } from "react-i18next";
import { useGetAdminDashboardStatsQuery } from "../../store/reportApi";
import {
  Home,
  DoorOpen,
  UserCheck,
  Users,
  PieChart as PieChartIcon,
  DoorClosed,
  Activity,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

const DashboardAdmin = () => {
  const { t } = useTranslation("dashboard");
  const {
    data: stats,
    isLoading,
    isError,
    isFetching,
  } = useGetAdminDashboardStatsQuery();

  if (isLoading || isFetching) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Spinner className="size-12 text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-center text-red-500">
        {t("dashboard.errorLoading")}
      </div>
    );
  }

  // Cấu hình các card để render vòng lặp cho gọn
  const cardConfigs = [
    {
      title: t("dashboard.totalHouses"),
      value: stats?.totalHouses,
      icon: <Home className="h-5 w-5 text-blue-600" />,
      description: t("dashboard.totalHousesDesc"),
      color: "border-l-4 border-l-blue-500",
    },
    {
      title: t("dashboard.totalOwners"),
      value: stats?.totalOwners,
      icon: <UserCheck className="h-5 w-5 text-indigo-600" />,
      description: t("dashboard.totalOwnersDesc"),
      color: "border-l-4 border-l-indigo-500",
    },
    {
      title: t("dashboard.totalTenants"),
      value: stats?.totalTenants,
      icon: <Users className="h-5 w-5 text-purple-600" />,
      description: t("dashboard.totalTenantsDesc"),
      color: "border-l-4 border-l-purple-500",
    },
    {
      title: t("dashboard.totalRooms"),
      value: stats?.totalRooms,
      icon: <DoorOpen className="h-5 w-5 text-slate-600" />,
      description: t("dashboard.totalRoomsDesc"),
      color: "border-l-4 border-l-slate-500",
    },
    {
      title: t("dashboard.occupiedRooms"),
      value: stats?.occupiedRooms,
      icon: <Activity className="h-5 w-5 text-green-600" />,
      description: t("dashboard.occupiedRoomsDesc"),
      color: "border-l-4 border-l-green-500",
    },
    {
      title: t("dashboard.vacantRooms"),
      value: stats?.vacantRooms,
      icon: <DoorClosed className="h-5 w-5 text-amber-600" />,
      description: t("dashboard.vacantRoomsDesc"),
      color: "border-l-4 border-l-amber-500",
    },
    {
      title: t("dashboard.occupancyRate"),
      value: `${stats?.occupancyRate}%`,
      icon: <PieChartIcon className="h-5 w-5 text-rose-600" />,
      description: t("dashboard.occupancyRateDesc"),
      color: "border-l-4 border-l-rose-500",
    },
  ];

  return (
    <div className="px-4 lg:px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          {t("dashboard.title")}
        </h1>
        <p className="text-sm text-muted-foreground italic">
          {t("dashboard.subtitle")}
        </p>
      </div>

      {/* Grid hiển thị các Card thống kê */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cardConfigs.map((card, index) => (
          <Card
            key={index}
            className={`shadow-sm transition-all hover:shadow-md ${card.color}`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Anh có thể thêm biểu đồ hoặc danh sách nhà trọ mới đăng ký tại đây sau này */}
    </div>
  );
};

export default DashboardAdmin;

import React, { useState, useEffect } from "react";
import { useAuth } from "@/features/auth";
import { useTranslation } from "react-i18next";
import { NavLink, useNavigate } from "react-router-dom";
import { useSearchContractsQuery } from "../../store/contractApi";
import { useGetHousesByOwnerIdQuery } from "../../store/houseApi";
import { useGetRoomsByHouseIdQuery } from "../../store/roomApi";
import useDebounce from "@/hooks/useDebounce";
import { format } from "date-fns";

import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Search,
  Plus,
  Eye,
  Calendar as CalendarIcon,
  Home,
  DoorOpen,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowRight,
} from "lucide-react";

import ContractStatusBadge from "../../components/Contract/ContractStatusBadge";
import EarlyContractAddDialog from "../../components/Contract/EarlyContractAddDialog";
import { CONTRACT_STATUS_MAP } from "@/assets/contract/contractStatus";

const ContractSearchOwner = () => {
  const { t } = useTranslation("contractinvoice");
  const { userId: ownerId } = useAuth();
  const navigate = useNavigate();

  // 🚨 STATE BỘ LỌC
  const [filters, setFilters] = useState({
    houseId: "all",
    roomId: "all",
    status: "all",
    keyword: "",
    fromDate: undefined,
    toDate: undefined,
    page: 0,
    size: 10,
  });

  const debouncedKeyword = useDebounce(filters.keyword, 500);

  // 1. Lấy danh sách Nhà
  const { data: housesData } = useGetHousesByOwnerIdQuery(
    { ownerId, page: 0, size: 100 },
    { skip: !ownerId }
  );
  const allHouses = housesData?.houses || [];

  // 2. Lấy danh sách Phòng dựa trên Nhà (Phụ thuộc)
  const { data: roomsData } = useGetRoomsByHouseIdQuery(
    { houseId: filters.houseId, page: 0, size: 200 },
    { skip: filters.houseId === "all" }
  );
  const houseRooms = roomsData?.content || [];

  // 3. Fetch dữ liệu Hợp đồng theo API Search
  const {
    data: searchResult,
    isLoading,
    isFetching,
    isError,
  } = useSearchContractsQuery({
    ...filters,
    keyword: debouncedKeyword,
    fromDate: filters.fromDate
      ? format(filters.fromDate, "yyyy-MM-dd")
      : undefined,
    toDate: filters.toDate ? format(filters.toDate, "yyyy-MM-dd") : undefined,
  });

  const contracts = searchResult?.content || [];
  const totalPages = searchResult?.totalPages || 0;

  // Reset Room khi House thay đổi
  useEffect(() => {
    setFilters((prev) => ({ ...prev, roomId: "all", page: 0 }));
  }, [filters.houseId]);

  // Reset Page về 0 khi có bất kỳ bộ lọc nào thay đổi (trừ page)
  useEffect(() => {
    setFilters((prev) => ({ ...prev, page: 0 }));
  }, [
    filters.houseId,
    filters.roomId,
    filters.status,
    debouncedKeyword,
    filters.fromDate,
    filters.toDate,
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  if (isError)
    return (
      <div className="p-10 text-center text-red-500">{t("ErrorLoadData")}</div>
    );

  return (
    <div className="px-4 lg:px-6 space-y-6">
      <EarlyContractAddDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />

      <header className="flex justify-between items-center border-b pb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CalendarIcon className="text-primary h-6 w-6" />{" "}
          {t("ContractManagement")}
        </h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> {t("CreateContract")}
        </Button>
      </header>

      {/* 🚨 BỘ LỌC HÀNG NGANG TỐI ƯU */}
      <Card className="shadow-sm border-purple-100">
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3 items-end">
            {/* House */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 flex items-center gap-1 uppercase">
                <Home size={12} /> {t("House")}
              </label>
              <Select
                value={filters.houseId}
                onValueChange={(val) =>
                  setFilters((p) => ({ ...p, houseId: val }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("AllHouse")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("AllHouse")}</SelectItem>
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
              <label className="text-xs font-semibold text-slate-500 flex items-center gap-1 uppercase">
                <DoorOpen size={12} /> {t("Room")}
              </label>
              <Select
                value={filters.roomId}
                onValueChange={(val) =>
                  setFilters((p) => ({ ...p, roomId: val }))
                }
                disabled={filters.houseId === "all"}
              >
                <SelectTrigger>
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
              <label className="text-xs font-semibold text-slate-500 flex items-center gap-1 uppercase">
                <Filter size={12} /> {t("Status")}
              </label>
              <Select
                value={filters.status}
                onValueChange={(val) =>
                  setFilters((p) => ({ ...p, status: val }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("AllStatus")}</SelectItem>
                  {Object.keys(CONTRACT_STATUS_MAP).map((key) => (
                    <SelectItem key={key} value={key}>
                      {t(CONTRACT_STATUS_MAP[key].label)}
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
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start font-normal px-2"
                  >
                    <CalendarIcon className="mr-1 h-4 w-4 text-slate-400" />
                    <span className="truncate">
                      {filters.fromDate
                        ? format(filters.fromDate, "dd/MM/yy")
                        : t("PickDate")}
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

            {/* To Date (MỚI BỔ SUNG) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase ml-1">
                {t("ToDate")}
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start font-normal px-2"
                  >
                    <CalendarIcon className="mr-1 h-4 w-4 text-slate-400" />
                    <span className="truncate">
                      {filters.toDate
                        ? format(filters.toDate, "dd/MM/yy")
                        : t("PickDate")}
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

            {/* Keyword Search */}
            <div className="space-y-1.5 lg:col-span-1">
              <label className="text-xs font-semibold text-slate-500 uppercase ml-1">
                {t("Keyword")}
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder={t("Search")}
                  className="pl-9"
                  value={filters.keyword}
                  onChange={(e) =>
                    setFilters((p) => ({ ...p, keyword: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* Reset Button */}
            <div className="flex justify-end lg:mb-0.5">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-slate-500 hover:text-red-500 h-9"
                onClick={() =>
                  setFilters({
                    houseId: "all",
                    roomId: "all",
                    status: "all",
                    keyword: "",
                    fromDate: undefined,
                    toDate: undefined,
                    page: 0,
                    size: 10,
                  })
                }
              >
                <X className="h-3 w-3 mr-1" /> {t("ResetFilters")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 🚨 BẢNG DANH SÁCH */}
      <div className="w-full p-1 rounded-lg border border-purple-300 shadow-md shadow-secondary ">
        <Table>
          <TableHeader className="bg-sidebar">
            <TableRow>
              <TableHead className="w-[50px]">{t("No")}</TableHead>
              <TableHead>
                {t("House")}/{t("Room")}
              </TableHead>
              <TableHead>{t("Representative")}</TableHead>
              <TableHead>{t("Duration")}</TableHead>
              <TableHead>{t("Status")}</TableHead>
              <TableHead className="text-right w-[100px]">
                {t("Action")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading || isFetching ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <Spinner className="mx-auto size-10 text-primary" />
                </TableCell>
              </TableRow>
            ) : contracts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-slate-400"
                >
                  {t("NoContractFound")}
                </TableCell>
              </TableRow>
            ) : (
              contracts.map((item, index) => (
                <TableRow
                  key={item.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <TableCell>
                    {filters.page * filters.size + index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-primary">
                      {item.roomName}
                    </div>
                    <div className="text-xs text-slate-500">
                      {item.houseName}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">
                      {item.tenants?.find((t) => t.representative)?.fullName ||
                        t("N/A")}
                    </div>
                    <div className="text-xs text-slate-400">
                      {item.tenants?.find((t) => t.representative)?.phoneNumber}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">
                        {format(new Date(item.startDate), "dd/MM/yy")}
                      </span>
                      <ArrowRight size={10} className="text-slate-400" />
                      <span className="font-medium">
                        {format(new Date(item.endDate), "dd/MM/yy")}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <ContractStatusBadge contractStatus={item.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-purple-200 hover:border-amber-500 hover:text-amber-500 shadow-sm"
                      asChild
                    >
                      <NavLink
                        to={`/owner/contracts/houses/${item.houseId}/contracts/${item.id}`}
                      >
                        <Eye className="h-4 w-4 mr-1" /> {t("View")}
                      </NavLink>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center p-4 border-t bg-sidebar">
            <p className="text-xs text-slate-500 font-medium">
              {t("Page")} {filters.page + 1} / {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-muted-foreground"
                onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))}
                disabled={filters.page === 0}
              >
                <ChevronLeft size={16} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-muted-foreground"
                onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))}
                disabled={filters.page >= totalPages - 1}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractSearchOwner;

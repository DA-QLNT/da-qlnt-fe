import React, { useState, useEffect } from "react";
import {
  useGetAllRepairRequestsQuery,
  useUpdateRepairStatusMutation,
} from "../../store/repairApi";
import { useGetHousesByOwnerIdQuery } from "../../store/houseApi";
import { useAuth } from "@/features/auth";
import useDebounce from "@/hooks/useDebounce";
import {
  Wrench,
  Loader2,
  Search,
  Filter,
  Info,
  User,
  ChevronLeft,
  ChevronRight,
  Home,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { REPAIR_STATUS_MAP } from "@/assets/repair/repairStatus";
import RepairProcessDialog from "../../components/Repair/RepairProcessDialog";
import { useTranslation } from "react-i18next";
import { formatDateTime } from "@/lib/format/dateTimeFormat";
import toast from "react-hot-toast";

const RepairStatusBadge = ({ status }) => {
  const { t } = useTranslation("repairreportrule");
  const statusInfo = REPAIR_STATUS_MAP[status] || REPAIR_STATUS_MAP[0];
  return (
    <Badge className={`uppercase ${statusInfo.color}`}>
      {t(statusInfo.label)}
    </Badge>
  );
};

export default function RepairOwner() {
  const { t } = useTranslation("repairreportrule");
  const { userId: ownerId } = useAuth();

  // State bộ lọc
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const [houseFilter, setHouseFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedKeyword = useDebounce(searchTerm, 500);

  // State Dialog
  const [processDialog, setProcessDialog] = useState({
    open: false,
    request: null,
  });
  const [loadingReceiveId, setLoadingReceiveId] = useState(null);

  // Fetch danh sách nhà để lọc
  const { data: housesData } = useGetHousesByOwnerIdQuery(
    { ownerId, page: 0, size: 100 },
    { skip: !ownerId }
  );

  // Fetch dữ liệu chính theo API bộ lọc
  const {
    data: repairData,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetAllRepairRequestsQuery({
    status: statusFilter,
    houseId: houseFilter,
    keyword: debouncedKeyword,
    page,
    size: 10,
  });

  const [updateRepairStatus] = useUpdateRepairStatusMutation();

  const requests = repairData?.content || [];
  const totalPages = repairData?.totalPages || 0;

  // Reset page khi thay đổi bộ lọc
  useEffect(() => {
    setPage(0);
  }, [statusFilter, houseFilter, debouncedKeyword]);

  const handleAction = (request) => setProcessDialog({ open: true, request });

  const handleReceive = async (request) => {
    setLoadingReceiveId(request.id);
    const toastId = toast.loading(t("Processing") + "...");
    try {
      await updateRepairStatus({ repairId: request.id, status: 2 }).unwrap();
      toast.success(t("Received"), { id: toastId });
    } catch (error) {
      toast.error(t("Failed"), { id: toastId });
    } finally {
      setLoadingReceiveId(null);
    }
  };

  if (isError)
    return (
      <div className="p-10 text-center text-red-500">{t("ErrorLoadData")}</div>
    );

  return (
    <div className="px-4 lg:px-6 space-y-6">
      <RepairProcessDialog
        request={processDialog.request}
        open={processDialog.open}
        onOpenChange={(open) => setProcessDialog((prev) => ({ ...prev, open }))}
      />

      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Wrench className="w-6 h-6 " /> {t("RepairManagement")}
        </h1>
      </div>

      {/* 🚨 BỘ LỌC HÀNG NGANG */}
      <Card className="border-purple-100 shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Lọc nhà */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
                <Home size={12} /> {t("House")}
              </label>
              <Select value={houseFilter} onValueChange={setHouseFilter}>
                <SelectTrigger className={"w-full"}>
                  <SelectValue placeholder={t("SelectHouse")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("AllHouse")}</SelectItem>
                  {housesData?.houses?.map((h) => (
                    <SelectItem key={h.id} value={h.id.toString()}>
                      {h.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Lọc trạng thái */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
                <Filter size={12} /> {t("Status")}
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className={"w-full"}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("AllStatus")}</SelectItem>
                  {Object.keys(REPAIR_STATUS_MAP).map((key) => (
                    <SelectItem key={key} value={key}>
                      {t(REPAIR_STATUS_MAP[key].label)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tìm kiếm keyword */}
            <div className="col-span-full md:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
                <Search size={12} /> {t("Search")}
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("EnterKeyworSearch")}
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">
            {t("ListRequest")} ({repairData?.totalElements || 0})
          </CardTitle>
          {(isLoading || isFetching) && (
            <Loader2 className="animate-spin text-primary" />
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">{t("No")}</TableHead>
                <TableHead>{t("Title")}</TableHead>
                <TableHead>
                  {t("House")}/{t("Room")}
                </TableHead>
                <TableHead>{t("Tenant")}</TableHead>
                <TableHead>{t("CreatedAt")}</TableHead>
                <TableHead>{t("Status")}</TableHead>
                <TableHead className="text-right">{t("Action")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 && !isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-10 text-muted-foreground"
                  >
                    {t("NoRequestRepair")}
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((req, index) => (
                  <TableRow key={req.id}>
                    <TableCell>{page * 10 + index + 1}</TableCell>
                    <TableCell className="font-medium">{req.title}</TableCell>
                    <TableCell>
                      <div className="text-sm font-semibold">
                        {req.roomName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {req.houseName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{req.tenantName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDateTime(req.createdAt).formattedDate}
                    </TableCell>
                    <TableCell>
                      <RepairStatusBadge status={req.status} />
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {req.status === 1 && (
                        <Button
                          size="sm"
                          variant="default"
                          disabled={loadingReceiveId === req.id}
                          onClick={() => handleReceive(req)}
                        >
                          {loadingReceiveId === req.id && (
                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                          )}
                          {t("Receive")}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction(req)}
                      >
                        {t("Detail")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>

        {totalPages > 1 && (
          <CardFooter className="flex justify-between border-t p-4">
            <p className="text-sm text-muted-foreground">
              {t("Page")} {page + 1} / {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 0}
              >
                <ChevronLeft size={16} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages - 1}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

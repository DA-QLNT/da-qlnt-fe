import React, { useState, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetHouseRepairRequestsQuery } from "../../store/repairApi";
import {
  Wrench,
  Loader2,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  ArrowLeft,
  Filter,
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { REPAIR_STATUS_MAP } from "@/assets/repair/repairStatus";
import RepairProcessDialog from "../../components/Repair/RepairProcessDialog";

// Component Badge cho Trạng thái (Giữ nguyên)
const RepairStatusBadge = ({ status }) => {
  const statusInfo = REPAIR_STATUS_MAP[status] || REPAIR_STATUS_MAP[0];
  const { label, color } = statusInfo;
  return <Badge className={`uppercase ${color}`}>{label}</Badge>;
};

// Map Trạng thái cho bộ lọc Select
const STATUS_FILTER_OPTIONS = [
  { label: "Tất cả trạng thái", value: "all" },
  { label: REPAIR_STATUS_MAP[1].label, value: "1" },
  { label: REPAIR_STATUS_MAP[2].label, value: "2" },
];

// Map trường cho Sắp xếp (Chỉ dùng Title, RoomName, Status)
const SORT_FIELD_OPTIONS = [
  { label: "Tiêu đề", value: "title" },
  { label: "Phòng", value: "roomName" },
  { label: "Trạng thái", value: "status" },
];

export default function RepairByHouse() {
  const { houseId } = useParams();
  const houseIdNumber = parseInt(houseId);
  const navigate = useNavigate();

  const [page, setPage] = useState(0);
  const pageSize = 10;

  // 🚨 STATE SẮP XẾP MỚI (chỉ key, direction được đổi qua nút Toggle)
  const [sortConfig, setSortConfig] = useState({
    key: "title", // Mặc định là Title
    direction: "asc",
  });
  // 🚨 STATE LỌC TRẠNG THÁI
  const [filterStatus, setFilterStatus] = useState("all");

  // 🚨 STATE CHO DIALOG XỬ LÝ
  const [processDialogData, setProcessDialogData] = useState({
    open: false,
    request: null,
  });

  // 🚨 FETCH DATA (Không truyền sort/filter lên API, xử lý Client-side)
  const {
    data: repairData,
    isLoading,
    isFetching,
    isError,
  } = useGetHouseRepairRequestsQuery(
    { houseId: houseIdNumber, page, size: pageSize },
    { skip: !houseIdNumber }
  );

  const rawRequests = repairData?.content || [];
  const totalPages = repairData?.totalPages || 0;
  const loading = isLoading || isFetching;

  // 🚨 LOGIC SẮP XẾP VÀ LỌC (Client-side)
  const filteredAndSortedRequests = useMemo(() => {
    let items = rawRequests;

    // 1. Lọc theo Status
    if (filterStatus !== "all") {
      const statusInt = parseInt(filterStatus);
      items = items.filter((req) => req.status === statusInt);
    }

    // 2. Sắp xếp
    const sortableItems = [...items];
    sortableItems.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      let comparison = 0;
      if (typeof aValue === "string") {
        comparison = String(aValue).localeCompare(String(bValue), "vi", {
          sensitivity: "base",
        });
      } else {
        if (aValue < bValue) comparison = -1;
        if (aValue > bValue) comparison = 1;
      }

      return sortConfig.direction === "asc" ? comparison : comparison * -1;
    });

    return sortableItems;
  }, [rawRequests, sortConfig, filterStatus]);

  // 🚨 HÀM XỬ LÝ CHUYỂN HƯỚNG SẮP XẾP
  //   const handleToggleSortDirection = () => {
  //     setSortConfig((prev) => ({
  //       ...prev,
  //       direction: prev.direction === "asc" ? "desc" : "asc",
  //     }));
  //   };

  // 🚨 HÀM XỬ LÝ ACTION (MỞ DIALOG PROCESS)
  const handleAction = (request) => {
    setProcessDialogData({ open: true, request });
  };

  if (isError) {
    return (
      <div className="p-6 text-center text-red-500">
        Lỗi tải danh sách yêu cầu sửa chữa.
      </div>
    );
  }

  if (loading && rawRequests.length === 0) {
    return <Spinner className="size-20 mx-auto mt-20" />;
  }

  return (
    <div className="px-4 lg:px-6 space-y-6">
      {/* 🚨 DIALOG XỬ LÝ/HOÀN THÀNH YÊU CẦU */}
      <RepairProcessDialog
        request={processDialogData.request}
        open={processDialogData.open}
        onOpenChange={(open) =>
          setProcessDialogData((prev) => ({ ...prev, open }))
        }
      />
      <header className="flex justify-between items-center border-b pb-4">
        <Button onClick={() => navigate("/owner/repairs")} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại danh sách nhà
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            Danh sách Yêu cầu ({repairData?.totalElements || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* BỘ LỌC VÀ SẮP XẾP */}
          <div className="flex flex-wrap gap-4 mb-4 items-end">
            {/* 1. Lọc theo Status (Dùng Select) */}
            <div className="w-[200px]">
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Lọc theo Trạng thái
              </label>
              <Select
                value={filterStatus}
                onValueChange={setFilterStatus}
                disabled={loading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_FILTER_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 2. Sắp xếp theo trường (Dùng Select) */}
            <div className="w-[200px]">
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Sắp xếp theo
              </label>
              <div className="flex items-center gap-2">
                <Select
                  value={sortConfig.key}
                  onValueChange={(val) =>
                    setSortConfig({ key: val, direction: "asc" })
                  }
                  disabled={loading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Lọc theo" />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_FIELD_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* Nút Toggle hướng sắp xếp */}
                {/* <Button
                  size="icon"
                  variant="outline"
                  onClick={handleToggleSortDirection}
                  disabled={loading}
                >
                  {sortConfig.direction === "asc" ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button> */}
              </div>
            </div>
          </div>

          {filteredAndSortedRequests.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">
              Không tìm thấy yêu cầu sửa chữa nào khớp với bộ lọc.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">STT</TableHead>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Phòng</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="w-[120px]">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedRequests.map((request, index) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-semibold">{index + 1}</TableCell>
                    <TableCell>{request.title}</TableCell>
                    <TableCell>{request.roomName}</TableCell>
                    <TableCell>
                      <RepairStatusBadge status={request.status} />
                    </TableCell>

                    <TableCell>
                      {/* Nút xử lý chính (Owner Action) */}
                      <Button
                        size="sm"
                        onClick={() => handleAction(request)}
                        variant={request.status === 0 ? "default" : "outline"}
                      >
                        {request.status === 0 ? "Xử lý" : "Xem chi tiết"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>

        {/* PHÂN TRANG */}
        {totalPages > 1 && (
          <CardFooter className="flex justify-between items-center">
            <small>
              Trang {page + 1} / {totalPages}
            </small>
            <div className="space-x-2">
              <Button
                size="sm"
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 0 || loading}
                variant="outline"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages - 1 || loading}
                variant="outline"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

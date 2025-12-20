import React, { useState } from "react";
import { useGetTenantRepairRequestsQuery } from "../../store/repairApi";
import { REPAIR_STATUS_MAP } from "@/assets/repair/repairStatus"; // Giả định import
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
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
  Loader2,
  Wrench,
  Plus,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Trash,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format/dateTimeFormat";
import RepairRequestFormDialog from "../../components/Repair/RepairRequestFormDialog";
import RepairRequestDetailDialog from "../../components/Repair/RepairRequestDetailDialog";
import RepairRequestDeleteConfirmDialog from "../../components/Repair/RepairRequestDeleteConfirmDialog";
import { useTranslation } from "react-i18next";

// Component Badge cho Trạng thái
const RepairStatusBadge = ({ status }) => {
  const { t } = useTranslation("repairreportrule");

  const statusInfo = REPAIR_STATUS_MAP[status] || REPAIR_STATUS_MAP[0];
  const { label, color } = statusInfo;
  return <Badge className={`uppercase ${color}`}>{t(`${label}`)}</Badge>;
};

export default function RepairTenant() {
  const { t } = useTranslation("repairreportrule");

  const [page, setPage] = useState(0);
  const pageSize = 10;

  // 🚨 STATE CHO DIALOG CREATE/EDIT
  const [dialogData, setDialogData] = useState({
    open: false,
    request: null, // Null nếu Create, object nếu Edit
  });
  // 🚨 STATE CHO DIALOG DETAIL
  const [detailDialogData, setDetailDialogData] = useState({
    open: false,
    request: null,
  });
  // 🚨 STATE CHO DIALOG DELETE
  const [deleteDialogData, setDeleteDialogData] = useState({
    open: false,
    repairId: null,
  });
  const {
    data: repairData,
    isLoading,
    isFetching,
    isError,
  } = useGetTenantRepairRequestsQuery({ page, size: pageSize });

  const repairRequests = repairData?.content || [];
  const totalPages = repairData?.totalPages || 0;
  const loading = isLoading || isFetching;
  const handleCreateNewRequest = () => {
    setDialogData({ open: true, request: null });
  };
  // 🚨 HÀM MỞ DIALOG CHI TIẾT
  const handleViewDetails = (request) => {
    setDetailDialogData({ open: true, request });
  };
  // 🚨 HÀM MỞ DIALOG (EDIT)
  const handleEditRequest = (request) => {
    // Chỉ cho phép sửa khi status là 0 (Chờ xử lý/Draft)
    if (request.status !== 0) {
      return toast.error(t("OnlyCanEditInPending"));
    }
    setDialogData({ open: true, request });
  };
  // 🚨 HÀM MỞ DIALOG XÓA
  const handleDeleteRequest = (request) => {
    if (request.status !== 0) {
      return toast.error(t("OnlyCanDeleteInPending"));
    }
    setDeleteDialogData({ open: true, repairId: request.id });
  };

  // Logic xử lý khi không có dữ liệu
  if (isError) {
    return (
      <div className="p-6 text-center text-red-500">
        {t("ErrorLoadingData")}
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-6 space-y-6">
      {/* 🚨 DIALOG TẠO/SỬA YÊU CẦU */}
      <RepairRequestFormDialog
        initialData={dialogData.request}
        open={dialogData.open}
        onOpenChange={(open) => setDialogData((prev) => ({ ...prev, open }))}
      />
      {/* 🚨 DIALOG XEM CHI TIẾT */}
      <RepairRequestDetailDialog
        request={detailDialogData.request}
        open={detailDialogData.open}
        onOpenChange={(open) =>
          setDetailDialogData((prev) => ({ ...prev, open }))
        }
      />
      {/* 🚨 DIALOG XÁC NHẬN XÓA */}
      <RepairRequestDeleteConfirmDialog
        repairId={deleteDialogData.repairId}
        open={deleteDialogData.open}
        onOpenChange={(open) =>
          setDeleteDialogData((prev) => ({ ...prev, open }))
        }
      />
      <header className="flex justify-between items-center border-b pb-4">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Wrench className="w-6 h-6" /> {t("MyRepairRequest")}
        </h1>

        {/* NÚT TẠO MỚI */}
        <Button onClick={handleCreateNewRequest} disabled={loading}>
          <Plus className="w-4 h-4 mr-2" /> {t("CreateNewRequest")}
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            {t("HistoryRequest")} ({repairData?.totalElements || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && repairRequests.length === 0 ? (
            <Spinner className="size-10 mx-auto" />
          ) : repairRequests.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">
              {t("NoRequest")}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12.5">{t("No")}</TableHead>
                  <TableHead>{t("Title")}</TableHead>
                  <TableHead>{t("Room")}</TableHead>
                  <TableHead>{t("House")}</TableHead>
                  <TableHead>{t("Status")}</TableHead>

                  <TableHead className="w-25">{t("Action")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {repairRequests.map((request, index) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-semibold">{index + 1}</TableCell>
                    <TableCell>{request.title}</TableCell>
                    <TableCell>{request.roomName}</TableCell>
                    <TableCell>{request.houseName}</TableCell>
                    <TableCell>
                      <RepairStatusBadge status={request.status} />
                    </TableCell>

                    <TableCell className="space-x-2">
                      {/* Nút thao tác (Sửa/Xóa/Xem chi tiết) */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetails(request)}
                      >
                        {t("View")}
                      </Button>

                      {/* Chỉ cho phép Sửa/Xóa khi còn là DRAFT (status 0) */}
                      {request.status === 0 && (
                        <>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleEditRequest(request)}
                            className="mr-2"
                          >
                            {t("Edit")}
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => handleDeleteRequest(request)}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </>
                      )}
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
              {t("Page")} {page + 1} / {totalPages}
            </small>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 0 || loading}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages - 1 || loading}
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

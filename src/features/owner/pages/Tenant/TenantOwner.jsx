import React, { useState, useEffect } from "react";
import { useGetTenantByOwnerIdAndSearchQuery } from "../../store/tenantApi";
import { useGetHousesByOwnerIdQuery } from "../../store/houseApi";
import { useGetRoomsByHouseIdQuery } from "../../store/roomApi";
import { useAuth } from "@/features/auth";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Mail, Phone, Home, DoorOpen, FilterX } from "lucide-react";
import TenantEditDialog from "../../components/Tenant/TenantEditDialog";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useDebounce from "@/hooks/useDebounce";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card, CardContent } from "@/components/ui/card";

const TenantOwner = () => {
  const { t } = useTranslation("usercontent");
  const { userId: ownerId, isLoadingMe } = useAuth();

  // --- States cho bộ lọc ---
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [selectedHouseId, setSelectedHouseId] = useState("all");
  const [selectedRoomId, setSelectedRoomId] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedKeyword = useDebounce(searchTerm, 500);

  // 1. Lấy danh sách nhà để làm bộ lọc
  const { data: housesData } = useGetHousesByOwnerIdQuery(
    { ownerId, page: 0, size: 100 },
    { skip: !ownerId }
  );
  const allHouses = housesData?.houses || [];

  // 2. Lấy danh sách phòng dựa trên Nhà được chọn (Phụ thuộc)
  const { data: roomsData, isFetching: loadingRooms } =
    useGetRoomsByHouseIdQuery(
      { houseId: selectedHouseId, page: 0, size: 200 },
      { skip: selectedHouseId === "all" }
    );
  const houseRooms = roomsData?.content || [];

  // 3. FETCH DỮ LIỆU TENANT CHÍNH THEO BỘ LỌC
  const {
    data: tenantData,
    isLoading: isLoadingTenant,
    isFetching,
    isError,
  } = useGetTenantByOwnerIdAndSearchQuery(
    {
      ownerId,
      page,
      size: pageSize,
      houseId: selectedHouseId,
      roomId: selectedRoomId,
      keyword: debouncedKeyword,
    },
    { skip: !ownerId || isLoadingMe }
  );

  const tenantsToDisplay = tenantData?.content || [];
  const totalPages = tenantData?.totalPages || 0;

  // Reset logic khi thay đổi bộ lọc
  useEffect(() => {
    setPage(0);
  }, [debouncedKeyword, selectedHouseId, selectedRoomId]);

  useEffect(() => {
    setSelectedRoomId("all");
  }, [selectedHouseId]);

  // Edit tenant state
  const [editDialog, setEditDialog] = useState({ open: false, tenantId: null });
  const openEditDialog = (id) => setEditDialog({ open: true, tenantId: id });
  const closeEditDialog = (open) => {
    if (!open) setEditDialog({ open: false, tenantId: null });
  };

  if (isLoadingTenant)
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="size-12 text-primary" />
      </div>
    );

  return (
    <div className="px-4 lg:px-6 space-y-6">
      <TenantEditDialog
        tenantId={editDialog.tenantId}
        open={editDialog.open}
        onOpenChange={closeEditDialog}
      />

      {/* 🚨 BỘ LỌC HÀNG NGANG */}
      <Card>
        <CardContent className="px-4 py-0">
          <div className={"grid grid-cols-2 lg:grid-cols-4 gap-4 relative"}>
            {/* Nút Reset bộ lọc */}
            <FilterX
              size={20}
              onClick={() => {
                setSelectedHouseId("all");
                setSelectedRoomId("all");
                setSearchTerm("");
              }}
              className="text-lg p-0 text-red-500 absolute -top-4 right-0"
            />
            {/* Lọc Nhà */}
            <div className="col-span-1 space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                <Home size={14} /> {t("House") || "Nhà"}
              </label>
              <Select
                value={selectedHouseId}
                onValueChange={setSelectedHouseId}
              >
                <SelectTrigger className={"w-full"}>
                  <SelectValue placeholder={t("SelectHouse") || "Chọn nhà"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("AllHouse") || "Tất cả nhà"}
                  </SelectItem>
                  {allHouses.map((h) => (
                    <SelectItem key={h.id} value={h.id.toString()}>
                      {h.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Lọc Phòng (Phụ thuộc vào Nhà) */}
            <div className="col-span-1 space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                <DoorOpen size={14} /> {t("Room") || "Phòng"}
              </label>
              <Select
                value={selectedRoomId}
                onValueChange={setSelectedRoomId}
                disabled={selectedHouseId === "all" || loadingRooms}
              >
                <SelectTrigger className={"w-full"}>
                  <SelectValue placeholder={t("SelectRoom") || "Chọn phòng"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("AllRoom") || "Tất cả phòng"}
                  </SelectItem>
                  {houseRooms.map((r) => (
                    <SelectItem key={r.id} value={r.id.toString()}>
                      {r.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tìm kiếm Keyword */}
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                <Search size={14} /> {t("Search") || "Tìm kiếm"}
              </label>
              <div className="relative">
                <Input
                  placeholder={
                    t("SearchTenantPlaceholder") || "Tìm tên, số điện thoại..."
                  }
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 🚨 BẢNG DANH SÁCH VỚI OVERLAY SPINNER */}
      <div className="w-full p-1 rounded-lg border border-purple-300 shadow-md relative overflow-hidden bg-sidebar">
        {/* Overlay Spinner khi đang fetch dữ liệu (Tìm kiếm/Lọc/Chuyển trang) */}
        {isFetching && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-muted/60 backdrop-blur-[1px]">
            <Spinner className="size-10 text-primary" />
          </div>
        )}

        <Table>
          <TableHeader className="bg-sidebar">
            <TableRow>
              <TableHead className="w-[50px]">{t("No")}</TableHead>
              <TableHead className="">{t("Tenant")}</TableHead>
              <TableHead>{t("PhoneNumber")}</TableHead>
              <TableHead className="text-right">{t("Action")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenantsToDisplay.length > 0 ? (
              tenantsToDisplay.map((tenant, index) => (
                <TableRow
                  key={tenant.id}
                  className="hover:bg-background transition-colors"
                >
                  <TableCell className="font-medium text-muted-foreground">
                    {page * pageSize + index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 p-0.5 bg-green-100 rounded-full border border-green-200 flex shrink-0">
                        <img
                          src={tenant.avatarUrl || "/userDefault.png"}
                          alt={tenant.fullName}
                          className="w-full rounded-full object-cover "
                        />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-foreground">
                          {tenant.fullName}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground italic">
                          <Mail size={12} /> {tenant.email || "N/A"}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone size={14} className="text-blue-500" />
                      {tenant.phoneNumber}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-purple-200 hover:border-amber-500 hover:text-amber-500"
                      onClick={() => openEditDialog(tenant.id)}
                    >
                      {t("Edit")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-32 text-center text-muted-foreground italic"
                >
                  {t("NoTenantFound") ||
                    "Không tìm thấy khách thuê nào phù hợp."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* PHÂN TRANG */}
      {totalPages > 1 && (
        <Pagination className="mt-4 flex justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                className="cursor-pointer"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i} className="hidden sm:inline-block">
                <PaginationLink
                  className="cursor-pointer"
                  onClick={() => setPage(i)}
                  isActive={i === page}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                className="cursor-pointer"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default TenantOwner;

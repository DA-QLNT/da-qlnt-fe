import React, { useState, useEffect } from "react";
import { useGetTenantByOwnerIdAndSearchQuery } from "../../store/tenantApi"; // Sử dụng hook mới
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
import { Search, UserRound, Mail, Phone, Loader2 } from "lucide-react";
import TenantEditDialog from "../../components/Tenant/TenantEditDialog";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useDebounce from "@/hooks/useDebounce"; // Hook debounce của anh
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const TenantOwner = () => {
  const { t } = useTranslation("usercontent");
  const { userId: ownerId, isLoadingMe } = useAuth();

  // State bộ lọc và tìm kiếm
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10); // Anh có thể để 10 hoặc 20 tùy ý
  const [searchTerm, setSearchTerm] = useState("");

  // 🚨 Áp dụng DEBOUNCE của anh
  const debouncedSearch = useDebounce(searchTerm, 500);

  // FETCH DỮ LIỆU TỪ BACKEND THEO KEYWORD
  const {
    data: tenantData,
    isLoading: isLoadingTenant,
    isFetching,
    isError,
  } = useGetTenantByOwnerIdAndSearchQuery(
    {
      ownerId: ownerId,
      page: page,
      size: pageSize,
      tenantName: debouncedSearch, // Dùng giá trị đã debounce
    },
    {
      skip: !ownerId || isLoadingMe,
    }
  );

  const tenantsToDisplay = tenantData?.content || [];
  const totalPages = tenantData?.totalPages || 0;

  // Reset về trang 0 khi người dùng gõ tìm kiếm
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch]);

  // Edit tenant state
  const [editDialog, setEditDialog] = useState({
    open: false,
    tenantId: null,
  });

  const openEditDialog = (tenantId) => {
    setEditDialog({ open: true, tenantId: tenantId });
  };

  const closeEditDialog = (open) => {
    if (!open) setEditDialog({ open: false, tenantId: null });
  };

  if (isLoadingTenant) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="size-12 text-primary" />
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-6 space-y-6">
      <TenantEditDialog
        tenantId={editDialog.tenantId}
        open={editDialog.open}
        onOpenChange={closeEditDialog}
      />

      {/* 🚨 THANH TÌM KIẾM HÀNG NGANG */}
      <div className="flex items-center justify-between gap-4 mt-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={
              t("SearchTenantPlaceholder") || "Tìm theo tên khách thuê..."
            }
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {isFetching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          )}
        </div>

        {/* Anh có thể thêm nút "Thêm khách mới" ở đây nếu cần */}
      </div>

      <div className="w-full p-1 rounded-lg border border-purple-300 shadow-md shadow-secondary bg-white">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[50px]">{t("No")}</TableHead>
              <TableHead className="min-w-[200px]">{t("Tenant")}</TableHead>
              <TableHead>{t("PhoneNumber")}</TableHead>
              <TableHead className="text-right">{t("Action")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenantsToDisplay.length > 0 ? (
              tenantsToDisplay.map((tenant, index) => (
                <TableRow
                  key={tenant.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <TableCell className="font-medium text-slate-500">
                    {page * pageSize + index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="p-1 bg-green-100 rounded-full border border-green-200">
                        <img
                          src={tenant.avatarUrl || "/userDefault.png"}
                          alt={tenant.fullName}
                          className="w-9 h-9 rounded-full object-cover"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-slate-800 flex items-center gap-1">
                          {tenant.fullName}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-slate-400 italic">
                          <Mail size={12} /> {tenant.email || "N/A"}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-slate-600">
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
                  className="h-32 text-center text-slate-400"
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

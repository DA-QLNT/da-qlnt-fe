import React, { useMemo, useState, useEffect } from "react";
import { useGetTenantsByOwnerIdQuery } from "../../store/tenantApi";
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
import { SquarePen } from "lucide-react";
import TenantEditDialog from "../../components/Tenant/TenantEditDialog";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
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
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(100);
  const [search, setSearch] = useState("");
  const {
    data: defaultTenantData,
    isLoading: isLoadingTenant,
    isError: isErrorTenant,
    error,
  } = useGetTenantsByOwnerIdQuery(
    {
      ownerId: ownerId,
      page: page,
      size: pageSize,
    },
    {
      skip: !ownerId || isLoadingMe,
    }
  );
  const defaultTenants = defaultTenantData?.content || [];
  const sortedTenantByName = useMemo(() => {
    return [...defaultTenants].sort((a, b) => {
      const nameA = (a.fullName ?? "").toLowerCase();
      const nameB = (b.fullName ?? "").toLowerCase();
      return nameA.localeCompare(nameB, "vi", { sensitivity: "base" });
    });
  }, [defaultTenants]);

  // pagination over sorted list
  const totalFilteredElements = sortedTenantByName.length;
  const totalPages = Math.ceil(totalFilteredElements / pageSize);
  const startIndex = page * pageSize;
  const tenantsToDisplay = sortedTenantByName.slice(
    startIndex,
    startIndex + pageSize
  );

  useEffect(() => {
    if (page >= totalPages && totalPages > 0) {
      setPage(totalPages - 1);
    } else if (totalPages === 0 && page !== 0) {
      setPage(0);
    }
  }, [totalPages, page]);

  //   edit tenant
  const [viewDialog, setViewDialog] = useState({
    open: false,
    tenantId: null,
  });
  const [editDialog, setEditDialog] = useState({
    open: false,
    tenantId: null,
  });
  const openViewDialog = (tenantId) => {
    setViewDialog({
      open: true,
      tenantId: tenantId,
    });
  };
  const closeViewDialog = (open) => {
    if (!open) {
      setViewDialog({
        open: false,
        tenantId: null,
      });
    } else {
      setViewDialog({ ...prev, open: true });
    }
  };
  const openEditDialog = (tenantId) => {
    setEditDialog({
      open: true,
      tenantId: tenantId,
    });
  };
  const closeEditDialog = (open) => {
    if (!open) {
      setEditDialog({
        open: false,
        tenantId: null,
      });
    }
  };

  if (isLoadingTenant) {
    return (
      <div className="absoulute inset-0 flex items-center justify-center">
        <Spinner className={"size-20 text-primary"} />
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-6">
      {/* dialog */}
      <TenantEditDialog
        tenantId={editDialog.tenantId}
        open={editDialog.open}
        onOpenChange={closeEditDialog}
      />

      {/* dialog */}
      <div className="w-full p-1 rounded-lg border border-purple-300 shadow-md shadow-secondary mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead colSpan={1}>{t("No")}</TableHead>
              <TableHead colSpan={2} className="w-[100px]">
                {t("Tenant")}
              </TableHead>
              <TableHead colSpan={2}>{t("PhoneNumber")}</TableHead>
              <TableHead className="text-right">{t("Action")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenantsToDisplay.map((tenant, index) => (
              <TableRow key={tenant.id}>
                <TableCell className={"w-[50px]"}>
                  {startIndex + index + 1}
                </TableCell>
                <TableCell colSpan={2} className="font-medium">
                  <div className="flex w-full items-center gap-2">
                    <div className="flex-shrink-0 p-0.5 bg-green-600 rounded-full">
                      <img
                        src={tenant.avatarUrl || "/userDefault.png"}
                        alt={tenant.fullName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="line-clamp-2 text-wrap break-all">
                        {tenant.fullName}
                      </h4>
                      <p className="line-clamp-2 text-wrap break-all text-foreground/50">
                        {tenant.email || "N/A"}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell colSpan={2}>{tenant.phoneNumber}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    onClick={() => {
                      openEditDialog(tenant.id);
                    }}
                  >
                    {t("Edit")}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {totalFilteredElements === 0 && (
              <TableRow>
                <TableCell colSpan={6}>{t("NoTenant")}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && (
        <Pagination className={"mt-4 flex"}>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              ></PaginationPrevious>
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  onClick={() => setPage(i)}
                  isActive={i === page}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                disabled={page === totalPages - 1}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              ></PaginationNext>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default TenantOwner;

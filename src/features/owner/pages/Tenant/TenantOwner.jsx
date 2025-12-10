import React, { useMemo, useState } from "react";
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
const TenantOwner = () => {
  const { userId: ownerId, isLoadingMe } = useAuth();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
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
        <Spinner />
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
              <TableHead colSpan={1}>STT</TableHead>
              <TableHead colSpan={2} className="w-[100px]">
                Tenant
              </TableHead>
              <TableHead colSpan={2}>SĐT</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTenantByName.map((tenant, index) => (
              <TableRow key={tenant.id}>
                <TableCell className={"w-[50px]"}>{index + 1}</TableCell>
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
                  <div className="flex justify-end">
                    <SquarePen
                      onClick={() => {
                        openEditDialog(tenant.id);
                      }}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {sortedTenantByName.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>Không có khách thuê</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TenantOwner;

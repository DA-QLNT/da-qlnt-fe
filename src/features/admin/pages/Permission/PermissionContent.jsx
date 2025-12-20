import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EllipsisVertical, Plus, SquarePen, Trash } from "lucide-react";
import React, { useMemo, useState } from "react";
import PermissionBadge from "../../components/permissions/PermissionBadge";
import { useGetPermissionsQuery } from "../../store/permissionApi";
import { Spinner } from "@/components/ui/spinner";
import { formatDateTime } from "@/lib/format/dateTimeFormat";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import PermissionDeleteConfirm from "../../components/permissions/PermissionDeleteConfirm";
import MatrixHooksWrapper from "../../components/permissions/MatrixHooksWrapper"; //  Đã sửa
import PermissionAddOrCreateDialog from "../../components/permissions/PermissionAddOrCreateDialog";
import { useTranslation } from "react-i18next";

const PermissionContent = () => {
  const { t } = useTranslation("permissioncontent");

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const {
    data: permissionData,
    isLoading,
    isError,
  } = useGetPermissionsQuery({
    page: page,
    size: pageSize,
  });
  const rawPermissions = permissionData?.permissions || [];
  const totalElements = permissionData?.totalElements || 0;
  const totalPages = permissionData?.totalPages || 0;

  // delete state
  const [deletePermissionDialog, setDeletePermissionDialog] = useState({
    open: false,
    permissionId: null,
    permissionCode: "",
  });
  // create or update permission
  const [createUpdateDialog, setCreateUpdateDialog] = useState({
    open: false,
    initialData: null,
  });

  // handle function====================

  const openDeletePermissionDialog = (permission) => {
    setDeletePermissionDialog({
      open: true,
      permissionId: permission.id,
      permissionCode: permission.code,
    });
  };
  // create or update
  const openAddDialog = () => {
    setCreateUpdateDialog({ open: true, initialData: null });
  };

  const openEditDialog = (permission) => {
    setCreateUpdateDialog({ open: true, initialData: permission });
  };
  const closeCreateUpdateDialog = (open) => {
    if (!open) {
      setCreateUpdateDialog({ open: false, initialData: null });
    }
  };

  // ==========logic========= // sort logic

  const sortedPermissions = useMemo(() => {
    return [...rawPermissions].sort((a, b) => {
      const codeA = a.code.toLowerCase();
      const codeB = b.code.toLowerCase();
      if (codeA < codeB) return -1;
      if (codeA > codeB) return 1;
      return 0;
    });
  }, [rawPermissions]); // ============UI==========

  if (isError) {
    return <div>Error load data</div>;
  }

  return (
    <div className="px-4 lg:px-6">
      <PermissionDeleteConfirm
        open={deletePermissionDialog.open}
        onOpenChange={(open) =>
          setDeletePermissionDialog({ ...deletePermissionDialog, open })
        }
        permissionId={deletePermissionDialog.permissionId}
        permissionCode={deletePermissionDialog.permissionCode}
      />
      <PermissionAddOrCreateDialog
        open={createUpdateDialog.open}
        onOpenChange={closeCreateUpdateDialog}
        initialData={createUpdateDialog.initialData}
      />
      <Tabs defaultValue="permissionList" className={"w-full"}>
        <TabsList>
          <TabsTrigger value="permissionList">{t("Permission")}</TabsTrigger>
          <TabsTrigger value="assignPermissionToRole">
            {t("AssignToRole")}
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="assignPermissionToRole"
          className={"flex flex-col md:flex-row gap-8"}
        >
          <MatrixHooksWrapper />
        </TabsContent>
        <TabsContent value="permissionList">
          <div className="mt-4 w-full flex flex-col lg:flex-row lg:justify-between gap-8">
            <div className={"order-1  lg:w-3/5"}>
              <div className="relative w-full p-1 rounded-lg border border-purple-300 shadow-md shadow-secondary">
                {isLoading && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center">
                    <Spinner className={"size-10 text-primary"} />
                  </div>
                )}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("No")}</TableHead>
                      <TableHead>{t("Permission")}</TableHead>
                      <TableHead>{t("CreatedAt")}</TableHead>
                      <TableHead className="text-right w-[100px]">
                        {t("Action")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedPermissions.map((permission, index) => (
                      <TableRow key={permission.id}>
                        <TableCell>{page * pageSize + index + 1}</TableCell>
                        <TableCell>
                          <PermissionBadge permissionName={permission.code} />
                        </TableCell>
                        <TableCell>
                          {formatDateTime(permission.createdAt).formattedDate}
                        </TableCell>
                        <TableCell className="text-right w-[100px]">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <EllipsisVertical size={20} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                onClick={() =>
                                  openDeletePermissionDialog(permission)
                                }
                                className={"text-red-500"}
                              >
                                <Trash className="mr-2 h-4 w-4 text-red-500" />
                                {t("Delete")}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openEditDialog(permission)}
                              >
                                <SquarePen className="mr-2 h-4 w-4" />
                                {t("Edit")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                    {sortedPermissions.length === 0 && !isLoading && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          {t("NoPermission")}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              {totalPages > 1 && (
                <Pagination className={"mt-4"}>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        disabled={page === 0}
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                      />
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
                        onClick={() =>
                          setPage((p) => Math.min(totalPages - 1, p + 1))
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
            <div className="order-0 lg:order-2 text-end">
              <Button onClick={openAddDialog}>
                <Plus className="mr-2 h-4 w-4" />
                {t("AddPermission")}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PermissionContent;

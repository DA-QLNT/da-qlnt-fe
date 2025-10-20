import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Ellipsis,
  EllipsisVertical,
  Eye,
  FunnelPlus,
  Plus,
  Search,
  SquarePen,
  Trash,
} from "lucide-react";
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useGetUsersQuery } from "../../store/userApi";
import { Spinner } from "@/components/ui/spinner";
import UserDeleteConfirm from "../../components/users/UserDeleteConfirm";
import UserAddDialog from "../../components/users/UserAddDialog";
import RoleBadgeGroup from "../../components/users/RoleBadgeGroup";
import UserViewProfileDialog from "./../../components/users/UserViewProfileDialog";
import { useTranslation } from "react-i18next";

const UserContent = () => {
  const {t} = useTranslation("usercontent")
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");

  const { data, isLoading, isError, error } = useGetUsersQuery({
    page: page,
    size: pageSize,
  });
  // get user
  const users = data?.users || [];

  const totalElements = data?.totalElements || 0;
  const totalPages = data?.totalPages || 0;
  // delete user
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    userId: null,
    username: "",
  });
  // create user
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  // view user profile
  const [viewDialog, setViewDialog] = useState({
    open: false,
    userId: null,
  });

  // function handle
  const openDeleteDialog = (user) => {
    setDeleteDialog({
      open: true,
      userId: user.id,
      username: user.username,
    });
  };
  const openViewDialog = (userId) => {
    setViewDialog({
      open: true,
      userId: userId,
    });
  };
  const closeViewDialog = (open) => {
    if (!open) {
      setViewDialog({
        open: false,
        userId: null,
      });
    } else {
      setViewDialog({ ...prev, open: true });
    }
  };

  if (isError)
    return <div className="p-6 text-center text-red-500">{t('ErrorLoadingData')}</div>;
  return (
    <div className="px-4 lg:px-6">
      {/* Delete user confirm */}
      <UserDeleteConfirm
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open }))}
        userId={deleteDialog.userId}
        username={deleteDialog.username}
      />
      {/* Add user dialog */}
      <UserAddDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
      {isLoading && (
        <div className="">
          <Spinner className="size-16 absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%]" />
        </div>
      )}
      {/* View User Profile Dialog */}
      <UserViewProfileDialog
        open={viewDialog.open}
        onOpenChange={closeViewDialog}
        userId={viewDialog.userId}
      />
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-4">
          <h1 className="text-2xl font-bold">
            {t("AllUser")} <span>{totalElements}</span>
          </h1>

          <div className="relative order-last w-full md:order-none md:w-1/3">
            <Search
              className="absolute left-2 top-1.5"
              size={24}
              strokeWidth={1.5}
            />
            <Input className="pl-9" type="text" placeholder="Search" />
          </div>
          <div className="flex items-center gap-2">
            <Button className="tracking-wider">
              <FunnelPlus />
              {t("Filter")}
            </Button>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(true)}>
              <Plus size={24} />
              {t("Add")}
            </Button>
          </div>
        </div>
        <Separator />
        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead colSpan={1}>{t("No")}</TableHead>
                <TableHead colSpan={2} className="w-[100px]">
                  {t("User")}
                </TableHead>
                <TableHead colSpan={2}>{t("Role")}</TableHead>
                <TableHead className="text-right">{t("Action")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell className={'w-[50px]'}>
                    {page * pageSize + index + 1}
                  </TableCell>
                  <TableCell colSpan={2} className="font-medium">
                    <div className="flex w-full items-center gap-2">
                      <div className="flex-shrink-0 p-0.5 bg-amber-400 rounded-full">
                        <img
                          src={user.avatarUrl || "/userDefault.png"}
                          alt={user.username}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="line-clamp-2 text-wrap break-all">
                          {user.username}
                        </h4>
                        <p className="line-clamp-2 text-wrap break-all text-foreground/50">
                          {user.email || "N/A"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell colSpan={2}>
                    <RoleBadgeGroup roles={user.roles} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <div>
                            <EllipsisVertical
                              className="hidden md:block cursor-pointer "
                              size={24}
                            />
                            <Ellipsis
                              className="block md:hidden cursor-pointer "
                              size={24}
                            />
                          </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          className="w-48 mr-4"
                          align="start"
                        >
                          <DropdownMenuGroup>
                            <DropdownMenuItem>
                              <SquarePen />
                              {t("Edit")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openViewDialog(user.id)}
                            >
                              <Eye />
                              {t("ViewProfile")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openDeleteDialog(user)}
                            >
                              <Trash color="red" />
                              <span className="text-red-500">
                                {t("Delete")}
                              </span>
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4}>No user</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
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
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default UserContent;

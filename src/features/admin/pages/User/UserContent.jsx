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
  ArrowDownZA,
  ArrowUpAz,
  Ellipsis,
  EllipsisVertical,
  Eye,
  FunnelPlus,
  Plus,
  Search,
  SquarePen,
  Trash,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useGetUsersQuery } from "../../store/userApi";
import { Spinner } from "@/components/ui/spinner";
import UserDeleteConfirm from "../../components/users/UserDeleteConfirm";
import UserAddDialog from "../../components/users/UserAddDialog";
import RoleBadgeGroup from "../../components/users/RoleBadgeGroup";
import UserViewProfileDialog from "./../../components/users/UserViewProfileDialog";
import { useTranslation } from "react-i18next";
import useDebounce from "@/hooks/useDebounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const sortOptions = [
  { value: "name_asc", label: "Name (A-Z)", type: "name", order: "asc" },
  { value: "name_desc", label: "Name (Z-A)", type: "name", order: "desc" },
  { value: "role_asc", label: "Role (A-Z)", type: "role", order: "asc" },
  { value: "role_desc", label: "Role (Z-A)", type: "role", order: "desc" },
];
const UserContent = () => {
  const { t } = useTranslation("usercontent");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");

  const {
    data: defaultData,
    isLoading,
    isError,
    error,
  } = useGetUsersQuery({
    page: page,
    size: pageSize,
  });
  // get user
  const defaultUsers = defaultData?.users || [];

  const defaultTotalElements = defaultData?.totalElements || 0;
  const defaultTotalPages = defaultData?.totalPages || 0;
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
  // sort & search
  const [searchTerm, setSearchTerm] = useState("");
  const [currentSort, setCurrentSort] = useState("none");

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { data: allUsersData, isLoading: isLoadingAllUsers } = useGetUsersQuery(
    {
      page: 0,
      size: 100, // Giả định size lớn để lấy toàn bộ (hoặc max)
    }
  );
  const allUsers = allUsersData?.users || [];

  // ===================================logic=================
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
  // handle sort
  const isFilteringOrSearching = currentSort !== "none" || debouncedSearchTerm;
  const filteredAndSortedUsers = useMemo(() => {
    if (!isFilteringOrSearching || isLoadingAllUsers) {
      return [];
    }
    let list = [...allUsers];
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      list = list.filter(
        (user) =>
          user.username.toLowerCase().includes(searchLower) 
        
        //  || user.email?.toLowerCase().includes(searchLower)
      );
    }
    if (currentSort !== "none") {
      const sortSetting = sortOptions.find(
        (option) => option.value === currentSort
      );
      if (sortSetting) {
        list.sort((a, b) => {
          let valA, valB;
          if (sortSetting.type === "name") {
            valA = a.username.toLowerCase();
            valB = b.username.toLowerCase();
          } else if (sortSetting.type === "role") {
            valA = (a.roles[0] || "").toLowerCase();
            valB = (b.roles[0] || "").toLowerCase();
          }
          let comparison = 0;
          if (valA > valB) comparison = 1;
          else if (valA < valB) comparison = -1;
          return sortSetting.order === "asc" ? comparison : comparison * -1;
        });
      }
    }
    return list;
  }, [
    allUsers,
    currentSort,
    debouncedSearchTerm,
    isLoadingAllUsers,
    isFilteringOrSearching,
  ]);
  let usersToDisplay, totalElements, totalPages, startIndex;

  // pagination
  if (isFilteringOrSearching) {
    totalElements = filteredAndSortedUsers.length;
    totalPages = Math.ceil(totalElements / pageSize);
    startIndex = page * pageSize;
    const endIndex = startIndex + pageSize;
    usersToDisplay = filteredAndSortedUsers.slice(startIndex, endIndex);
  } else {
    usersToDisplay = defaultUsers;
    totalElements = defaultTotalElements;
    totalPages = defaultTotalPages;
    startIndex = page * pageSize;
  }
  useEffect(() => {
    if (page >= totalPages && totalPages > 0) {
      setPage(totalPages - 1);
    } else if (totalPages === 0 && page !== 0) {
      setPage(0);
    }
  }, [page, totalPages]);
  const handleSortChange = (value) => {
    setCurrentSort(value);
    setPage(0);
  };
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  //===========UI=========
  if (isError)
    return (
      <div className="p-6 text-center text-red-500">
        {t("ErrorLoadingData")}
      </div>
    );
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
            <Input
              className="pl-9"
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={currentSort}
              onValueChange={handleSortChange}
              disabled={isLoadingAllUsers}
            >
              <SelectTrigger className={"w-[180px] tracking-wider"}>
                <FunnelPlus size={24} />
                <SelectValue placeholder={t("SortBy")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t("NoSort")}</SelectItem>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className={'flex items-center'}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              {usersToDisplay.map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell className={"w-[50px]"}>
                    {startIndex + index + 1}
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
              {usersToDisplay.length === 0 && (
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

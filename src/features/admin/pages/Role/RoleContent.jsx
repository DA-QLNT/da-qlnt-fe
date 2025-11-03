import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { useEffect, useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format/dateTimeFormat";
import RoleBadge from "../../components/roles/RoleBadge";
import { Button } from "@/components/ui/button";
import { useGetRolesQuery } from "../../store/roleApi";
import RoleAddDialog from "../../components/roles/RoleAddDialog";
import {
  EllipsisVertical,
  FunnelPlus,
  Plus,
  Trash,
  UserPen,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useGetUsersQuery } from "../../store/userApi";
import RoleAssignDialog from "../../components/roles/RoleAssignDialog";
import { Spinner } from "@/components/ui/spinner";
import RoleBadgeGroup from "../../components/users/RoleBadgeGroup";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import RoleDeleteConfirm from "../../components/roles/RoleDeleteConfirm";
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
const RoleContent = () => {
  const { t } = useTranslation("rolecontent");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const {
    data: roleData,
    isLoading: isLoadingRoles,
    isError: isRoleError,
  } = useGetRolesQuery({
    // page: page,
    // size: pageSize,
    page: 0,
    size: 100,
  });

  // delete role state
  const [deleteRoleDialog, setDeleteRoleDialog] = useState({
    open: false,
    roleId: null,
    roleName: "",
  });

  const roles = roleData?.roles || [];
  //   const totalElements = roleData?.totalElements || 0;
  const totalPages = roleData?.totalPages || 0;

  // assign role state
  const [assignDialog, setAssignDialog] = useState({
    open: false,
    user: null,
  });
  // user list
  const {
    data: defaultUserData,
    isLoading: isLoadingUsers,
    isError: isUserError,
  } = useGetUsersQuery({
    page: page,
    size: pageSize,
  });
  const defaultUsers = defaultUserData?.users || [];
  const defaultTotalUserElements = defaultUserData?.totalElements || 0;
  const defaultTotalUserPages = defaultUserData?.totalPages || 0;

  const { data: allUsersData, isLoading: isLoadingAllUsers } = useGetUsersQuery(
    { page: 0, size: 100 }
  );
  const allUsers = allUsersData?.users || [];

  // search & filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [currentSort, setCurrentSort] = useState("none");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // ===============logic==================
  // handle open dialog assign
  const openAssignDialog = (user) => {
    setAssignDialog({ open: true, user });
  };
  const closeAssignDialog = (open) => {
    // Khi đóng, reset user về null
    if (!open) {
      setAssignDialog({ open: false, user: null });
    } else {
      setAssignDialog((prev) => ({ ...prev, open: true }));
    }
  };
  // handle open dialog delete role
  const openDeleteRoleDialog = (role) => {
    setDeleteRoleDialog({
      open: true,
      roleId: role.id,
      roleName: role.name,
    });
  };
  // handle search&sort
  const isFilteringOrSearching = currentSort !== "none" || debouncedSearchTerm;
  const filteredAndSortedUsers = useMemo(() => {
    if (!isFilteringOrSearching || isLoadingAllUsers) {
      return [];
    }
    let list = [...allUsers];
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      list = list.filter((user) =>
        user.username.toLowerCase().includes(searchLower)
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

  // pagination
  let usersToDisplay, totalUserElements, totalUserPages, startIndex;
  if (isFilteringOrSearching) {
    totalUserElements = filteredAndSortedUsers.length;
    totalUserPages = Math.ceil(totalUserElements / pageSize);
    startIndex = page * pageSize;
    const endIndex = startIndex + pageSize;
    usersToDisplay = filteredAndSortedUsers.slice(startIndex, endIndex);
  } else {
    usersToDisplay = defaultUsers;
    totalUserElements = defaultTotalUserElements;
    totalUserPages = defaultTotalUserPages;
    startIndex = page * pageSize;
  }
  useEffect(() => {
    if (page >= totalUserPages && totalUserPages > 0) {
      setPage(totalUserPages - 1);
    } else if (totalUserPages === 0 && page !== 0) {
      setPage(0);
    }
  }, [page, totalUserPages]);

  const handleSortChange = (value) => {
    setCurrentSort(value);
    setPage(0);
  };
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  if (isRoleError || isUserError) {
    return (
      <div className="p-6 text-center text-red-500">
        {t("ErrorLoadingData")}
      </div>
    );
  }
  return (
    <div className="px-4 lg:px-6">
      <RoleAddDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
      <RoleDeleteConfirm
        open={deleteRoleDialog.open}
        onOpenChange={(open) =>
          setDeleteRoleDialog({ ...deleteRoleDialog, open })
        }
        roleId={deleteRoleDialog.roleId}
        roleName={deleteRoleDialog.roleName}
      />
      <RoleAssignDialog
        open={assignDialog.open}
        onOpenChange={closeAssignDialog}
        selectedUser={assignDialog.user}
      />
      <Tabs defaultValue="roleList" className={"w-full "}>
        <TabsList>
          <TabsTrigger value="roleList">{t("RoleList")}</TabsTrigger>
          <TabsTrigger value="assignRoleToUser">
            {t("AssignRoleToUser")}
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="roleList"
          className={"flex flex-col md:flex-row gap-8"}
        >
          <div className="mt-4 w-full flex flex-col lg:flex-row lg:justify-between gap-8">
            {isLoadingRoles && (
              <div className="absolute inset-0 z-10 flex items-center justify-center">
                <Spinner className={"size-10"} />
              </div>
            )}
            <div
              className={
                "order-1 lg:w-3/5 p-1 rounded-lg border border-purple-300 shadow-md shadow-secondary"
              }
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead colSpan={1}>{t("No")}</TableHead>
                    <TableHead colSpan={2}>{t("Role")}</TableHead>
                    <TableHead colSpan={2}>{t("Created")}</TableHead>
                    <TableHead className="text-right">{t("Actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role, index) => (
                    <TableRow key={role.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell colSpan={2}>
                        <RoleBadge roleName={role.name} />
                      </TableCell>
                      <TableCell colSpan={2}>
                        {formatDateTime(role.createdAt).formattedDate}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <EllipsisVertical size={20} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => openDeleteRoleDialog(role)}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              {t("DeleteRole")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {roles.length === 0 && !isLoadingRoles && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        No roles created
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* pagination */}
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
            <div className="order-0 lg:order-2 text-end ">
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t("AddNewRole")}
              </Button>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="assignRoleToUser">
          <div className="flex flex-col gap-4 mt-4">
            <h1 className="text-2xl font-bold">
              {t("TotalUser")} <span>{totalUserElements}</span>
            </h1>
            <div className="flex gap-4">
              <Input
                type={"text"}
                placeholder="search name"
                className={"w-2/3 md:max-w-[300px]"}
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <div className="flex gap-2">
                {/* Select Filter/Sort */}
                <Select
                  value={currentSort}
                  onValueChange={handleSortChange}
                  disabled={isLoadingAllUsers}
                >
                  <SelectTrigger className={"w-[180px] tracking-wider"}>
                    <FunnelPlus size={24} className="mr-2" />
                    <SelectValue placeholder={t("SortBy")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("NoSort")}</SelectItem>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {t(`${option.label}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="w-full p-1 rounded-lg border border-purple-300 shadow-md shadow-secondary">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead colSpan={1}>{t("No")}</TableHead>
                    <TableHead colSpan={2}>{t("User")}</TableHead>
                    <TableHead colSpan={2}>{t("Role")}</TableHead>
                    <TableHead className="text-right">{t("Actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersToDisplay.map((user, index) => (
                    <TableRow key={user.id}>
                      <TableCell className={"w-[50px]"}>
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <EllipsisVertical size={20} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => openAssignDialog(user)}
                            >
                              <UserPen className="mr-2 h-4 w-4" />
                              {t("AssignRole")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {usersToDisplay.length === 0 && !isLoadingUsers && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        No user created
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {isLoadingUsers && (
              <div className="text-center p-4 size-10 ">
                <Spinner />
              </div>
            )}
            {/* Pagination cho User List */}
            {totalUserPages > 1 && (
              <Pagination className={"mt-4"}>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      disabled={page === 0}
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                    />
                  </PaginationItem>
                  {[...Array(totalUserPages)].map((_, i) => (
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
                      disabled={page === totalUserPages - 1}
                      onClick={() =>
                        setPage((p) => Math.min(totalUserPages - 1, p + 1))
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RoleContent;

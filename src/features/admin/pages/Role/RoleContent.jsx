import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { useState } from "react";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format/dateTimeFormat";
import RoleBadge from "../../components/roles/RoleBadge";
import { Button } from "@/components/ui/button";
import { useGetRolesQuery } from "../../store/roleApi";
import RoleAddDialog from "../../components/roles/RoleAddDialog";
import { EllipsisVertical, FunnelPlus, Plus, UserPen } from "lucide-react";
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const RoleContent = () => {

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
    data: userData,
    isLoading: isLoadingUsers,
    isError: isUserError,
  } = useGetUsersQuery({
    page: page,
    size: pageSize,
  });
  const users = userData?.users || [];
  const totalUserElements = userData?.totalElements || 0;
  const totalUserPages = userData?.totalPages || 0;

  // handle open dialog
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
  if (isRoleError || isUserError) {
    return <div className="p-6 text-center text-red-500">Lỗi tải dữ liệu.</div>;
  }


  return (
    <div className="px-4 lg:px-6">
      <RoleAddDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
      <RoleAssignDialog
        open={assignDialog.open}
        onOpenChange={closeAssignDialog}
        selectedUser={assignDialog.user}
      />
      <Tabs defaultValue="role" className={"w-full "}>
        <TabsList>
          <TabsTrigger value="role">Roles List</TabsTrigger>
          <TabsTrigger value="user">Assign Role</TabsTrigger>
        </TabsList>
        <TabsContent value="user">
          <div className="flex flex-col gap-4 mt-4">
            <h1 className="text-2xl font-bold">
              User List <span>{totalUserElements}</span>
            </h1>
            <div className="flex gap-4">
              <Input
                type={"text"}
                placeholder="search name"
                className={"w-2/3 md:max-w-[300px]"}
              />
              <Button className="tracking-wider">
                <FunnelPlus />
                Filter
              </Button>
            </div>

            {isLoadingUsers && (
              <div className="text-center p-4">
                <Spinner /> Đang tải người dùng...
              </div>
            )}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">No</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right w-[100px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user, index) => (
                  <TableRow key={user.id}>
                    <TableCell>{page * pageSize + index + 1}</TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <img
                          src={user.avatarUrl || "/userDefault.png"}
                          alt={user.username}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <h4>{user.username}</h4>
                          <p className="text-sm text-gray-500">
                            {user.email || "N/A"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
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
                            Gán Role
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && !isLoadingUsers && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      Không tìm thấy người dùng.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

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
        <TabsContent value="role" className={"flex flex-col md:flex-row gap-8"}>
          <div className="mt-4 w-full flex flex-col md:flex-row gap-8">
            <div className={"order-1 md:w-3/5 lg:w-3/5"}>
              <div className="relative">
                {isLoadingRoles && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center">
                    <Spinner className={'size-10'}/>
                  </div>
                )}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead colsSpan={1}>No</TableHead>
                      <TableHead colsSpan={2}>Role</TableHead>
                      <TableHead colsSpan={2}>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.map((role, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell colsSpan={2}>
                          <RoleBadge roleName={role.name} />
                        </TableCell>
                        <TableCell colsSpan={2}>
                          {formatDateTime(role.createdAt).formattedDate}
                        </TableCell>
                      </TableRow>
                    ))}
                    {roles.length === 0 && !isLoadingRoles && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          Chưa có Role nào được tạo.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
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
            <div className="order-0 md:order-2 text-end md:relative">
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className={"md:absolute md:left-[0%] top-[20%]"}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add new role
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RoleContent;

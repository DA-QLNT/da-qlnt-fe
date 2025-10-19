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
import { Plus } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

const RoleContent = () => {
  //   const roles = [
  //     {
  //       isActive: true,
  //       createdAt: "2025-10-12T16:31:44.508496",
  //       updatedAt: "2025-10-12T16:31:44.508496",
  //       id: 1,
  //       name: "ADMIN",
  //     },
  //     {
  //       isActive: true,
  //       createdAt: "2025-10-14T22:57:33.699452",
  //       updatedAt: "2025-10-14T22:57:33.699452",
  //       id: 2,
  //       name: "OWNER",
  //     },
  //     {
  //       isActive: true,
  //       createdAt: "2025-10-17T22:06:25.51946",
  //       updatedAt: "2025-10-17T22:06:25.51946",
  //       id: 3,
  //       name: "USER",
  //     },
  //   ];
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { data, isLoading, isError } = useGetRolesQuery({
    page: page,
    size: pageSize,
  });

  const roles = data?.roles || [];
  const totalElements = data?.totalElements || 0;
  const totalPages = data?.totalPages || 0;

  if (isError) {
    return (
      <div className="p-6 text-center text-red-500">Lỗi tải dữ liệu Role.</div>
    );
  }
  return (
    <div className="px-4 lg:px-6">
      <RoleAddDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
      <Tabs defaultValue="user" className={"w-full "}>
        <TabsList>
          <TabsTrigger value="user">User</TabsTrigger>
          <TabsTrigger value="role">Roles</TabsTrigger>
        </TabsList>
        <TabsContent value="user">
          <Input type={"text"} placeholder="search name" />
        </TabsContent>
        <TabsContent value="role" className={"flex flex-col md:flex-row gap-8"}>
          <div className="mt-4 w-full flex flex-col md:flex-row gap-8">
            <div className={"order-1 md:w-3/5 lg:w-3/5"}>
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
                  {roles.length === 0 && !isLoading && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        Chưa có Role nào được tạo.
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

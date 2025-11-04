import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Spinner } from "@/components/ui/spinner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGetServicesQuery } from "../../store/serviceApi";
import ServiceTypeBadge from "../../components/Service/ServiceTypeBadge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import ServiceUpsertDialog from "../../components/Service/ServiceUpsertDialog";

const ServiceOwner = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, isFetching, isError } = useGetServicesQuery({
    page,
    size: pageSize,
  });
  const services = data?.content || [];
  const totalElements = data?.totalElements || 0;
  const totalPages = data?.totalPages || 0;
  // create || update
  const [upsertDialog, setUpsertDialog] = useState({
    open: false,
    initialData: null,
  });
  const openAddDialog = () => {
    setUpsertDialog({
      open: true,
      initialData: null,
    });
  };
  const openEditDialog = (service) => {
    setUpsertDialog({
      open: true,
      initialData: service,
    });
  };
  const closeUpsertDialog = (open) => {
    if (!open) {
      setUpsertDialog({
        open: open,
        initialData: null,
      });
    }
  };

  // ====UI=============
  if (isLoading || isFetching) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <Spinner className="size-20" />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="p-6 text-center text-red-500">
        Lỗi tải danh sách Dịch vụ.
      </div>
    );
  }
  return (
    <div className="px-4 lg:px-6">
      {/* Dialog */}
      <ServiceUpsertDialog
        open={upsertDialog.open}
        onOpenChange={closeUpsertDialog}
        initialData={upsertDialog.initialData}
      />
      
      {/* Dialog */}
      <div className="w-full p-1 rounded-lg border border-purple-300 shadow-md shadow-secondary">
        <Table>
          <TableHeader className={"bg-sidebar"}>
            <TableRow>
              <TableHead className="w-[50px]">No</TableHead>
              <TableHead>Tên dịch vụ</TableHead>
              <TableHead className="">Cách tính tiền</TableHead>
              <TableHead className="">Đơn vị</TableHead>
              <TableHead className="text-right w-[100px]">
                <Button
                  variant={"outline"}
                  className={
                    "border-purple-400 dark:border-purple-400 hover:border-amber-500 hover:text-amber-500"
                  }
                  onClick={openAddDialog}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground"
                >
                  Chưa có loại dịch vụ nào được tạo
                </TableCell>
              </TableRow>
            ) : (
              services.map((service, index) => (
                <TableRow key={service.id}>
                  <TableCell className={"w-[50px]"}>{index + 1}</TableCell>
                  <TableCell>
                    <h4 className="font-semibold text-wrap ">{service.name}</h4>
                  </TableCell>
                  <TableCell className="font-medium">
                    <ServiceTypeBadge type={service.type} />
                  </TableCell>
                  <TableCell className="font-medium">{service.unit}</TableCell>
                  <TableCell className={"flex justify-end"}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <EllipsisVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-48 mr-4" align="start">
                        <DropdownMenuGroup>
                          <DropdownMenuItem onClick={() => openEditDialog(service)}>
                            <SquarePen />
                            Edit
                          </DropdownMenuItem>

                          <DropdownMenuItem>
                            <Trash color="red" />
                            <span className="text-red-500">Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {/* 🚨 PHÂN TRANG */}
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
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default ServiceOwner;

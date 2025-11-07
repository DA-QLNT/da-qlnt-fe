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
  PackagePlus,
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
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import ServiceUpsertDialog from "../../components/Service/ServiceUpsertDialog";
import ServiceDeleteConfirm from "../../components/Service/ServiceDeleteConfirm";
import ServiceHouseAddDialog from "../../components/Service/ServiceHouseAddDialog";

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

  // delete
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    serviceId: null,
    serviceName: "",
  });
  const openDeleteDialog = (service) => {
    setDeleteDialog({
      open: true,
      serviceId: service.id,
      serviceName: service.name,
    });
  };

  const [serviceHouseAddDialog, setServiceHouseAddDialog] = useState({
    open: false,
    serviceId: null,
    serviceName: "",
  });
  const openServiceHouseAddDialog = (service) => {
    setServiceHouseAddDialog({
      open: true,
      serviceId: service.id,
      serviceName: service.name,
    });
  };
  const closeServiceHouseAddDialog = (open) => {
    if (!open) {
      setServiceHouseAddDialog({
        open: open,
        serviceId: null,
        serviceName: "",
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
      <ServiceHouseAddDialog
        open={serviceHouseAddDialog.open}
        serviceId={serviceHouseAddDialog.serviceId}
        serviceName={serviceHouseAddDialog.serviceName}
        onOpenChange={closeServiceHouseAddDialog}
      />
      <ServiceDeleteConfirm
        serviceId={deleteDialog.serviceId}
        serviceName={deleteDialog.serviceName}
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog((prev) => ({
            ...prev,
            open,
            serviceId: open ? prev.serviceId : null,
          }))
        }
      />
      <ServiceUpsertDialog
        open={upsertDialog.open}
        onOpenChange={closeUpsertDialog}
        initialData={upsertDialog.initialData}
      />

      {/* Dialog */}

      <Tabs defaultValue="serviceList" className={"w-full "}>
        <TabsList>
          <TabsTrigger value="serviceList">Service list</TabsTrigger>
          <TabsTrigger value="serviceHouse">Service & House</TabsTrigger>
        </TabsList>
        <TabsContent value="serviceHouse">abc</TabsContent>

        <TabsContent value="serviceList">
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
                        <h4 className="font-semibold text-wrap ">
                          {service.name}
                        </h4>
                      </TableCell>
                      <TableCell className="font-medium">
                        <ServiceTypeBadge type={service.type} />
                      </TableCell>
                      <TableCell className="font-medium">
                        {service.unit}
                      </TableCell>
                      <TableCell className={"flex justify-end"}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <EllipsisVertical className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            className="w-48 mr-4"
                            align="start"
                          >
                            <DropdownMenuGroup>
                              <DropdownMenuItem
                                onClick={() => openServiceHouseAddDialog(service)}
                              >
                                Add service - house
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openServiceHouseAddDialog(service)}
                              >
                                Edit service - house
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => openEditDialog(service)}
                              >
                                <SquarePen />
                                Edit service
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => openDeleteDialog(service)}
                              >
                                <Trash color="red" />
                                <span className="text-red-500">Delete service</span>
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
          {/* PHÂN TRANG */}
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ServiceOwner;

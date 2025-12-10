import React, { useMemo, useState } from "react";
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
import { useAuth } from "@/features/auth";
import { useGetHousesByOwnerIdQuery } from "../../store/houseApi";
import ServiceHouseListServiceDialog from "../../components/Service/ServiceHouseListServiceDialog";
import { NavLink } from "react-router-dom";

const ServiceOwner = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const { userId: ownerId, isLoadingMe } = useAuth();

  // get house-list
  const {
    data: houseData,
    isLoading: houseLoading,
    isFetching: houseFetching,
    isError: houseError,
  } = useGetHousesByOwnerIdQuery(
    {
      ownerId: ownerId,
      page: 0,
      size: 20,
    },
    {
      skip: !ownerId || isLoadingMe,
    }
  );
  const rawHouses = houseData?.houses || [];
  const sortedHouses = useMemo(() => {
    const housesCopy = [...rawHouses];
    return housesCopy.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      return nameA.localeCompare(nameB, "vi", { sensitivity: "base" });
    });
  }, [rawHouses]);

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
  // ======house-service

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

  const [serviceHouseListServiceDialog, setServiceHouseListServiceDialog] =
    useState({
      open: false,
      houseId: null,
      houseName: "",
    });
  const openServiceHouseListServiceDialog = (house) => {
    setServiceHouseListServiceDialog({
      open: true,
      houseId: house.id,
      houseName: house.name,
    });
  };
  const closeServiceHouseListServiceDialog = (open) => {
    if (!open) {
      setServiceHouseListServiceDialog({
        open: open,
        houseId: null,
        houseName: "",
      });
    }
  };

  // ====UI=============
  if (isLoading || isFetching || houseLoading || houseFetching) {
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
      <ServiceHouseListServiceDialog
        open={serviceHouseListServiceDialog.open}
        onOpenChange={closeServiceHouseListServiceDialog}
        houseId={serviceHouseListServiceDialog.houseId}
        houseName={serviceHouseListServiceDialog.houseName}
      />
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
          <TabsTrigger value="serviceList">Danh sách dịch vụ</TabsTrigger>
          <TabsTrigger value="serviceHouse">Dịch vụ đã có của nhà</TabsTrigger>
        </TabsList>
        {/* Dịch vụ đã có của nhà */}
        <TabsContent value="serviceHouse">
          <div className="w-full  p-1 rounded-lg border border-purple-300 shadow-md shadow-secondary">
            <Table>
              <TableHeader className={"bg-sidebar"}>
                <TableRow>
                  <TableHead className="w-[50px]">STT</TableHead>
                  <TableHead className={"w-[250px]"}>Nhà</TableHead>
                  <TableHead className={"hidden sm:table-cell"}>
                    Địa chỉ
                  </TableHead>
                  <TableHead className="text-right w-[100px]">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedHouses.length > 0 &&
                  sortedHouses.map((house, index) => (
                    <TableRow key={house.id}>
                      <TableCell className={"w-[50px]"}>{index + 1}</TableCell>
                      <TableCell>
                        <h4 className="font-semibold text-wrap ">
                          {house.name}
                        </h4>
                      </TableCell>
                      <TableCell className={"hidden sm:table-cell"}>
                        <h4 className="text-muted-foreground text-wrap ">
                          {house.address}-{house.district}-{house.province}
                        </h4>
                      </TableCell>
                      <TableCell className={"flex justify-end"}>
                        <SquarePen
                          onClick={() => {
                            openServiceHouseListServiceDialog(house);
                          }}
                          className="h-4 w-4 md:w-6 lg:h-6"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        {/* Danh sách dịch vụ */}
        <TabsContent value="serviceList">
          <div className="w-full p-1 rounded-lg border border-purple-300 shadow-md shadow-secondary">
            <Table>
              <TableHeader className={"bg-sidebar"}>
                <TableRow>
                  <TableHead className="w-[50px]">STT</TableHead>
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
                      Thêm dịch vụ
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
                                onClick={() =>
                                  openServiceHouseAddDialog(service)
                                }
                              >
                                Thêm dịch vụ vào nhà
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => openEditDialog(service)}
                              >
                                <SquarePen />
                                Sửa dịch vụ
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => openDeleteDialog(service)}
                              >
                                <Trash color="red" />
                                <span className="text-red-500">
                                  Xóa dịch vụ
                                </span>
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

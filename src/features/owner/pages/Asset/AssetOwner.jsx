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
import { Spinner } from "@/components/ui/spinner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGetAssetsQuery } from "../../store/assetApi";
import AssetDeleteConfirm from "../../components/Asset/AssetDeleteConfirm";
import AssetCreatOrUpdateDialog from "../../components/Asset/AssetCreatOrUpdateDialog";
import AssetItemsViewDialog from "../../components/Asset/AssetItemsViewDialog";
const AssetOwner = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const {
    data: assetData,
    isLoading: isLoadingAssets,
    isFetching: isFetchingAssets,
    isError: isErrorAssets,
  } = useGetAssetsQuery({ page, size: pageSize });
  const assets = assetData?.content || [];
  const totalElements = assetData?.totalElements || 0;
  const totalPages = assetData?.totalPages || 0;
  // create || edit
  const [createOrEditDialog, setCreateOrEditDialog] = useState({
    open: false,
    initialData: null, // Dữ liệu khi edit
  });
  const openAddDialog = () => {
    setCreateOrEditDialog({ open: true, initialData: null });
  };

  const openEditDialog = (asset) => {
    setCreateOrEditDialog({ open: true, initialData: asset });
  };

  const closeCreateOrEditDialog = (open) => {
    if (!open) {
      setCreateOrEditDialog({ open: false, initialData: null });
    } else {
      setCreateOrEditDialog((prev) => ({ ...prev, open: true }));
    }
  };

  // view item of an asset
  const [viewItemsDialog, setViewItemsDialog] = useState({
    open: false,
    assetId: null,
  });
  // Hàm mở Dialog View Items
  const openViewItemsDialog = (assetId) => {
    setViewItemsDialog({ open: true, assetId });
  };

  // Hàm đóng Dialog
  const closeViewItemsDialog = (open) => {
    if (!open) {
      setViewItemsDialog({ open: false, assetId: null });
    } else {
      setViewItemsDialog((prev) => ({ ...prev, open: true }));
    }
  };

  // delete
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    assetId: null,
    assetName: "",
  });

  const assetSummary = useMemo(() => {
    return assets.map((asset) => ({
      ...asset,
      itemCount: asset.assetItems?.length || 0,
    }));
  }, [assets]);

  // handle================
  const openDeleteDialog = (asset) => {
    setDeleteDialog({
      open: true,
      assetId: asset.id,
      assetName: asset.name,
    });
  };

  if (isLoadingAssets || isFetchingAssets) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <Spinner className={"size-20"} />
      </div>
    );
  }
  if (isErrorAssets) {
    return (
      <div className="p-6 text-center text-red-500">
        Lỗi tải danh sách Assets.
      </div>
    );
  }
  return (
    <div className="px-4 lg:px-6">
      {/* dialog */}
      <AssetItemsViewDialog
        open={viewItemsDialog.open}
        onOpenChange={closeViewItemsDialog}
        assetId={viewItemsDialog.assetId}
      />

      <AssetCreatOrUpdateDialog
        open={createOrEditDialog.open}
        onOpenChange={closeCreateOrEditDialog}
        initialData={createOrEditDialog.initialData}
      />
      <AssetDeleteConfirm
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog((prev) => ({
            ...prev,
            open,
            assetId: open ? prev.assetId : null,
          }))
        }
        assetId={deleteDialog.assetId}
        assetName={deleteDialog.assetName}
      />

      {/* end dialog */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Quản lý Tài Sản ({totalElements} Loại)
        </h1>
      </header>
      <div className="w-full lg:w-1/2 rounded-lg border shadow-md shadow-secondary">
        <Table>
          <TableHeader className={"bg-sidebar"}>
            <TableRow>
              <TableHead className="w-[50px]">No</TableHead>
              <TableHead>Tên Tài Sản</TableHead>
              <TableHead className="w-[150px]">Tổng Số Lượng</TableHead>
              <TableHead className="text-right w-[100px]">
                <Button variant={"outline"} onClick={openAddDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assetSummary.length === 0 && !isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground"
                >
                  Chưa có loại tài sản nào được đăng ký.
                </TableCell>
              </TableRow>
            ) : (
              assetSummary.map((asset, index) => (
                <TableRow key={asset.id}>
                  <TableCell>{page * pageSize + index + 1}</TableCell>
                  <TableCell>
                    <h4 className="font-semibold">{asset.name}</h4>
                  </TableCell>
                  <TableCell className="font-medium text-center">
                    {asset.itemCount}
                  </TableCell>
                  <TableCell className={"flex justify-end"}>
                    {" "}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant={"outline"} className={"px-1"}>
                          Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-48 mr-4" align="start">
                        <DropdownMenuGroup>
                          {/* <DropdownMenuItem
                          onClick={() => openEditDialog(user.id)}
                          >
                            <Plus />
                            Add Item
                          </DropdownMenuItem> */}
                          <DropdownMenuItem
                            onClick={() => openEditDialog(asset)}
                          >
                            <SquarePen />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                          onClick={() => openViewItemsDialog(asset.id)}
                          >
                            <Eye />
                            View Items
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(asset)}
                          >
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
    </div>
  );
};

<TableCell className={"flex justify-end"}>
  {" "}
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant={"outline"} className={"px-1"}>
        Actions
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-48 mr-4" align="start">
      <DropdownMenuGroup>
        <DropdownMenuItem
        // onClick={() => openEditDialog(user.id)}
        >
          <Plus />
          Add Item
        </DropdownMenuItem>
        <DropdownMenuItem
        // onClick={() => openEditDialog(user.id)}
        >
          <SquarePen />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
        // onClick={() => openViewDialog(user.id)}
        >
          <Eye />
          View Items
        </DropdownMenuItem>
        <DropdownMenuItem
        // onClick={() => openDeleteDialog(user)}
        >
          <Trash color="red" />
          <span className="text-red-500">Delete</span>
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  </DropdownMenu>
</TableCell>;
export default AssetOwner;

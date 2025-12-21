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
import { useTranslation } from "react-i18next";

const AssetOwner = () => {
  const { t } = useTranslation("asset");
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

  // if (isErrorAssets) {
  //   return (
  //     <div className="p-6 text-center text-red-500">
  //       {t("ErrorLoadAssets")}
  //     </div>
  //   );
  // }
  return (
    <div className="px-4 lg:px-6">
      {/* initial */}
      {(isLoadingAssets || isFetchingAssets) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner className={"size-20 text-primary"} />
        </div>
      )}

      {/* initial */}

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
          {t("Title", { total: totalElements })}
        </h1>
      </header>
      <div className="w-full  p-1 rounded-lg border border-purple-300 shadow-md shadow-secondary">
        <Table>
          <TableHeader className={"bg-sidebar"}>
            <TableRow>
              <TableHead className="w-[50px]">{t("No")}</TableHead>
              <TableHead>{t("AssetName")}</TableHead>
              <TableHead>{t("TotalAmount")}</TableHead>
              <TableHead className="text-right">
                <Button
                  variant={"outline"}
                  className={
                    "border-purple-400 dark:border-purple-400 hover:border-amber-500 hover:text-amber-500"
                  }
                  onClick={openAddDialog}
                >
                  {t("Add")}
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assetSummary.length === 0 && !isLoadingAssets ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground"
                >
                  {t("NoAssetsRegistered")}
                </TableCell>
              </TableRow>
            ) : (
              assetSummary.map((asset, index) => (
                <TableRow key={asset.id}>
                  <TableCell>{page * pageSize + index + 1}</TableCell>
                  <TableCell>
                    <h4 className="font-semibold">{asset.name}</h4>
                  </TableCell>
                  <TableCell>{asset.itemCount}</TableCell>
                  <TableCell className={"flex justify-end gap-2"}>
                    <div className="md:hidden">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button className="px-1" variant={"outline"}>
                            {t("Actions")}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          className="w-48 mr-4"
                          align="start"
                        >
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
                              {t("Edit")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openViewItemsDialog(asset.id)}
                            >
                              <Eye />
                              {t("ViewItems")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openDeleteDialog(asset)}
                            >
                              <Trash color="red" />
                              <span className="text-red-500">{t("Delete")}</span>
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="hidden md:flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(asset)}
                      >
                        {t("Edit")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openViewItemsDialog(asset.id)}
                      >
                        {t("ViewItems")}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openDeleteDialog(asset)}
                      >
                        {t("Delete")}
                      </Button>
                    </div>
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

export default AssetOwner;

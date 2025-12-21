import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, Loader2, Info, X } from "lucide-react";
import React, { useState } from "react";
import { useGetAssetByIdQuery } from "../../store/assetApi";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AssetImageViewer } from "./../../../../components/common/ImageViewer";
import { formatCurrency } from "./../../../../lib/format/currencyFormat";
import { useTranslation } from "react-i18next";

export default function AssetItemsViewDialog({ assetId, open, onOpenChange }) {
  const { t } = useTranslation("asset");
  const {
    data: asset,
    isLoading,
    isFetching,
    isError,
  } = useGetAssetByIdQuery(assetId, {
    skip: !assetId || !open,
  });

  const assetItems = asset?.assetItems || [];
  const loading = isLoading || isFetching;

  if (isError) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="text-red-500">
          {t("ErrorLoadAssetDetails")}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/*  Tăng sm:max-w để có không gian cho bảng */}
      <DialogContent className="sm:max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            {t("ItemListTitle", { name: asset?.name || "...", count: assetItems.length })}
          </DialogTitle>
        </DialogHeader>

        {/*  BẢNG ASSET ITEMS (W-FULL) */}
        <div className="flex flex-col border rounded-lg overflow-hidden flex-1">
          <ScrollArea className="flex-1 h-full min-h-[300px]">
            <div className="overflow-x-auto">
              <Table className="relative min-w-max">
                <TableHeader className="sticky top-0 bg-secondary z-10">
                  <TableRow>
                    <TableHead className="w-[30px]">{t("No")}</TableHead>
                    <TableHead>{t("Description")}</TableHead>
                    <TableHead className="w-[150px]">{t("PurchasePrice")}</TableHead>
                    <TableHead className="w-[150px]">{t("PurchaseDate")}</TableHead>
                    <TableHead className="w-[80px]">{t("Status")}</TableHead>
                    <TableHead className="w-[50px] text-right">{t("Image")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <Spinner /> {t("Loading")}
                      </TableCell>
                    </TableRow>
                  ) : assetItems.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground"
                      >
                        {t("NoItems")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    assetItems.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="max-w-[200px]">
                          {item.description || "N/A"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatCurrency(item.price)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {item.boughtAt}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              item.status === 0 ? "success" : "destructive"
                            }
                          >
                            {item.status === 0 ? t("Good") : t("Broken")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={!item.imageUrl}
                              >
                                <Eye
                                  className={`w-4 h-4 ${
                                    item.imageUrl
                                      ? "text-primary"
                                      : "text-muted-foreground"
                                  }`}
                                />
                              </Button>
                            </PopoverTrigger>
                            {item.imageUrl && (
                              <PopoverContent className="w-auto p-0 border-none bg-transparent shadow-2xl">
                                <AssetImageViewer imageUrl={item.imageUrl} />
                              </PopoverContent>
                            )}
                          </Popover>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

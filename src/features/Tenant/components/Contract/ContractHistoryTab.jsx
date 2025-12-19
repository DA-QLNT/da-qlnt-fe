import React, { useState } from "react";
import { useGetTenantContractHistoryQuery } from "../../store/contractApi";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileClock, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/lib/format/currencyFormat";
import { formatDateTime } from "@/lib/format/dateTimeFormat";
import ContractStatusBadge from "../../../owner/components/Contract/ContractStatusBadge";
import ContractDetailView from "./ContractDetailView";
import { ScrollArea } from "@/components/ui/scroll-area";

const ContractHistoryTab = () => {
  const [page, setPage] = useState(0);
  const [selectedContract, setSelectedContract] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Gọi API lấy lịch sử
  const { data, isLoading, isFetching } = useGetTenantContractHistoryQuery({
    page,
    size: 10,
  });

  const history = data?.content || [];
  const totalPages = data?.totalPages || 0;

  const handleOpenDetail = (contract) => {
    setSelectedContract(contract);
    setIsDetailOpen(true);
  };

  if (isLoading || isFetching) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Spinner className="size-10 text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <FileClock className="h-5 w-5 text-muted-foreground" />
            Lịch sử các hợp đồng trước đây
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nhà / Phòng</TableHead>
                <TableHead>Thời hạn</TableHead>
                <TableHead>Giá thuê</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-10 text-muted-foreground"
                  >
                    Anh chưa có lịch sử hợp đồng nào trước đây.
                  </TableCell>
                </TableRow>
              ) : (
                history.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium">{item.roomName}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.houseName}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex flex-col">
                        <span>
                          T: {formatDateTime(item.startDate).formattedDate}
                        </span>
                        <span>
                          Đ: {formatDateTime(item.endDate).formattedDate}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-primary">
                      {formatCurrency(item.rent)}
                    </TableCell>
                    <TableCell>
                      <ContractStatusBadge contractStatus={item.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDetail(item)}
                        className="hover:text-primary"
                      >
                        <Eye className="size-4 mr-2" /> Chi tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-end space-x-4 py-4 border-t mt-4">
              <span className="text-sm text-muted-foreground">
                Trang {page + 1} / {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages - 1}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* DIALOG CHI TIẾT HỢP ĐỒNG LỊCH SỬ */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-4xl p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2 border-b bg-muted/20">
            <DialogTitle className="text-2xl flex items-center gap-2">
              <FileClock className="h-6 w-6 text-primary" />
              Chi tiết hợp đồng #{selectedContract?.id}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh]">
            <div className="p-6">
              <ContractDetailView contract={selectedContract} />
            </div>
          </ScrollArea>
          <div className="p-4 border-t bg-muted/10 flex justify-end">
            <Button variant="secondary" onClick={() => setIsDetailOpen(false)}>
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContractHistoryTab;

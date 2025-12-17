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
import ContractDetailView from "../../components/Contract/ContractDetailView";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";

const ContractHistoryTenant = () => {
  const [page, setPage] = useState(0);
  const [selectedContract, setSelectedContract] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const navigate = useNavigate();

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
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner className="size-12" />
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-6 space-y-6">
      <header className="flex justify-between items-center border-b pb-4">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <FileClock className="w-6 h-6" /> Lịch sử thuê nhà
        </h1>
        <Button variant="outline" onClick={() => navigate("/tenant/contracts")}>
          Quay lại
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách hợp đồng</CardTitle>
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
                    className="text-center py-8 text-muted-foreground"
                  >
                    Chưa có lịch sử hợp đồng nào.
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
                      <div>
                        T: {formatDateTime(item.startDate).formattedDate}
                      </div>
                      <div>Đ: {formatDateTime(item.endDate).formattedDate}</div>
                    </TableCell>
                    <TableCell>{formatCurrency(item.rent)}</TableCell>
                    <TableCell>
                      <ContractStatusBadge contractStatus={item.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDetail(item)}
                      >
                        <Eye className="size-4 mr-2" /> Chi tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-end space-x-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <span className="text-sm">
                Trang {page + 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages - 1}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* DIALOG CHI TIẾT */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-4xl p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-2xl flex items-center gap-2">
              <FileClock className="h-6 w-6" /> Chi tiết hợp đồng #
              {selectedContract?.id}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-120px)] p-6">
            <ContractDetailView contract={selectedContract} />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContractHistoryTenant;

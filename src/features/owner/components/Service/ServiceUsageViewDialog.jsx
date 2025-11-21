// src/features/service/components/ServiceUsageViewDialog.jsx
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useGetServiceUsagesByRoomIdQuery } from "../../store/serviceApi";
import { Loader2 } from "lucide-react";

const ServiceUsageViewDialog = ({ open, onOpenChange, roomId, roomName }) => {
  const {
    data: serviceUsages,
    isLoading,
    isError,
  } = useGetServiceUsagesByRoomIdQuery(roomId, {
    skip: !roomId || !open,
  });

  const getApprovalBadge = (isApproved) => {
    if (isApproved === 1) {
      return <Badge className="bg-green-500">Đã xác nhận</Badge>;
    }
    return <Badge variant="secondary">Chưa xác nhận</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
    w-full
    sm:max-w-3xl
    overflow-auto
  "
      >
        <DialogHeader>
          <DialogTitle>Chỉ số dịch vụ phòng {roomName}</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Đang tải dữ liệu...
            </div>
          ) : isError ? (
            <div className="text-red-500 text-center">
              Không thể tải thông tin chỉ số dịch vụ.
            </div>
          ) : !serviceUsages || serviceUsages.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              Phòng này chưa có chỉ số dịch vụ nào.
            </div>
          ) : (
            <ScrollArea className="h-80">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dịch vụ</TableHead>
                    <TableHead>Tháng/Năm</TableHead>
                    <TableHead className="text-right">Chỉ số đầu</TableHead>
                    <TableHead className="text-right">Chỉ số cuối</TableHead>
                    <TableHead className="text-right">Tiêu thụ</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviceUsages.map((usage) => {
                    const consumption =
                      usage.currentReading && usage.previousReading
                        ? (
                            usage.currentReading - usage.previousReading
                          ).toFixed(2)
                        : "N/A";
                    return (
                      <TableRow key={usage.id}>
                        <TableCell className="font-medium">
                          {usage.serviceName}
                        </TableCell>
                        <TableCell>
                          {usage.month}/{usage.year}
                        </TableCell>
                        <TableCell className="text-right">
                          {usage.previousReading ?? "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          {usage.currentReading ?? "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          {consumption}
                        </TableCell>
                        <TableCell>
                          {getApprovalBadge(usage.isApproved)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Đóng</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceUsageViewDialog;

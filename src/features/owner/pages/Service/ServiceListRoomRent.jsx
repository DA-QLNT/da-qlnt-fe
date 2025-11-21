import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format/currencyFormat";
import { useTranslation } from "react-i18next";
import { EllipsisVertical, Loader2, CheckCircle } from "lucide-react";
import { useParams } from "react-router-dom";
import { useGetRoomsByHouseIdAndStatusQuery } from "../../store/roomApi";
import RoomStatusBadge from "../../components/Room/RoomStatusBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useConfirmServiceUsageMutation } from "../../store/serviceApi";
import ServiceUsageDeclareDialog from "../../components/Service/ServiceUsageDeclareDialog";
import ServiceUsageViewDialog from "../../components/Service/ServiceUsageViewDialog";
import toast from "react-hot-toast";

const ServiceListRoomRent = () => {
  const { t } = useTranslation();
  const { houseId } = useParams();

  // State cho Declare Dialog
  const [isDeclareDialogOpen, setIsDeclareDialogOpen] = useState(false);
  const [selectedRoomIdForDeclare, setSelectedRoomIdForDeclare] =
    useState(null);

  // State cho View Dialog
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedRoomForView, setSelectedRoomForView] = useState(null);

  const { data: rentedRooms, isLoading: loadingRentedRooms } =
    useGetRoomsByHouseIdAndStatusQuery(
      {
        houseId: Number(houseId),
        status: 1,
        page: 0,
        size: 20,
      },
      {
        skip: !houseId,
      }
    );
  const roomsToDisplay = rentedRooms?.content || [];

  const [confirmServiceUsage, { isLoading: isConfirming }] =
    useConfirmServiceUsageMutation();

  const handleOpenDeclareDialog = (roomId) => {
    setSelectedRoomIdForDeclare(roomId);
    setIsDeclareDialogOpen(true);
  };

  const handleOpenViewDialog = (room) => {
    setSelectedRoomForView(room);
    setIsViewDialogOpen(true);
  };

  const handleConfirmAll = async () => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    if (
      !window.confirm(
        `Bạn có chắc muốn xác nhận tất cả chỉ số cho tháng ${currentMonth}/${currentYear} không?`
      )
    ) {
      return;
    }

    try {
      await confirmServiceUsage({
        month: currentMonth,
        year: currentYear,
      }).unwrap();
      toast.success(
        `Đã xác nhận tất cả chỉ số cho tháng ${currentMonth}/${currentYear}!`
      );
    } catch (error) {
      toast.error(error.data?.message || "Xác nhận chỉ số thất bại.");
      console.error("Confirm service usage error:", error);
    }
  };

  return (
    <div className="px-4 lg:px-6">
      {/* Declare Dialog */}
      <ServiceUsageDeclareDialog
        open={isDeclareDialogOpen}
        onOpenChange={setIsDeclareDialogOpen}
        roomId={selectedRoomIdForDeclare}
      />

      {/* View Dialog */}
      <ServiceUsageViewDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        roomId={selectedRoomForView?.id}
        roomName={selectedRoomForView?.code}
      />

      {/* Header với nút Confirm All */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Danh sách phòng đang thuê</h2>
        <Button
          onClick={handleConfirmAll}
          disabled={isConfirming || roomsToDisplay.length === 0}
          className="gap-2"
        >
          {isConfirming ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          Xác nhận tất cả chỉ số
        </Button>
      </div>

      <div className="w-full p-1 rounded-lg border border-purple-300 shadow-md shadow-secondary">
        <Table>
          <TableHeader className="bg-sidebar">
            <TableRow>
              <TableHead className="w-[50px]">No</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right w-[100px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingRentedRooms ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : roomsToDisplay.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground"
                >
                  Không có phòng nào đang cho thuê
                </TableCell>
              </TableRow>
            ) : (
              roomsToDisplay.map((room, index) => (
                <TableRow key={room.id}>
                  <TableCell className="w-[50px]">{index + 1}</TableCell>
                  <TableCell>
                    <h4 className="font-semibold line-clamp-1">{room.code}</h4>
                  </TableCell>
                  <TableCell>{formatCurrency(room.rent)}</TableCell>
                  <TableCell>
                    <RoomStatusBadge status={room.status} />
                  </TableCell>
                  <TableCell className="flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <EllipsisVertical />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            onClick={() => handleOpenDeclareDialog(room.id)}
                          >
                            Khai báo chỉ số
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleOpenViewDialog(room)}
                          >
                            Xem chỉ số
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

export default ServiceListRoomRent;

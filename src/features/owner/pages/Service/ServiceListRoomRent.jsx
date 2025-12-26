import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useParams } from "react-router-dom";
import { useSearchRoomsQuery } from "../../store/roomApi"; // Hook mới
import { useGetHousesByOwnerIdQuery } from "../../store/houseApi";
import { useConfirmServiceUsageMutation } from "../../store/serviceApi";
import { useAuth } from "@/features/auth";
import useDebounce from "@/hooks/useDebounce";
import { formatCurrency } from "@/lib/format/currencyFormat";
import toast from "react-hot-toast";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  EllipsisVertical,
  Loader2,
  CheckCircle,
  Search,
  Home,
  FilterX,
  PencilRuler,
  Eye,
  ReceiptText,
  FilePlus,
} from "lucide-react";

import RoomStatusBadge from "../../components/Room/RoomStatusBadge";
import ServiceUsageDeclareDialog from "../../components/Service/ServiceUsageDeclareDialog";
import ServiceUsageViewDialog from "../../components/Service/ServiceUsageViewDialog";
import InvoiceCreateConfirmDialog from "../../components/Service/InvoiceCreateConfirmDialog";
import InvoiceListDialog from "../../components/Service/InvoiceListDialog";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent } from "@/components/ui/card";

const ServiceListRoomRent = () => {
  const { t } = useTranslation("service");
  const { houseId: urlHouseId } = useParams();
  const { userId: ownerId } = useAuth();

  // --- States cho bộ lọc ---
  const [selectedHouseId, setSelectedHouseId] = useState(urlHouseId || "all");
  const [searchKeyword, setSearchKeyword] = useState("");
  const debouncedKeyword = useDebounce(searchKeyword, 500);
  const [page, setPage] = useState(0);

  // --- States cho Dialogs ---
  const [isDeclareDialogOpen, setIsDeclareDialogOpen] = useState(false);
  const [selectedRoomIdForDeclare, setSelectedRoomIdForDeclare] =
    useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedRoomForView, setSelectedRoomForView] = useState(null);
  const [invoiceListDialog, setInvoiceListDialog] = useState({
    open: false,
    roomId: null,
  });
  const [isInvoiceCreateConfirmOpen, setIsInvoiceCreateConfirmOpen] =
    useState(false);
  const [roomIdForInvoice, setRoomIdForInvoice] = useState(null);

  // 1. Lấy danh sách nhà để làm bộ lọc
  const { data: housesData } = useGetHousesByOwnerIdQuery(
    { ownerId, page: 0, size: 100 },
    { skip: !ownerId }
  );
  const allHouses = housesData?.houses || [];

  // 2. Lấy danh sách phòng ĐÃ THUÊ (status = 1) theo bộ lọc
  const {
    data: roomsData,
    isLoading,
    isFetching,
  } = useSearchRoomsQuery({
    houseId: selectedHouseId === "all" ? undefined : selectedHouseId,
    status: 1, // Fix cứng status = 1 như anh yêu cầu
    keyword: debouncedKeyword,
    page: page,
    size: 20,
  });

  const roomsToDisplay = roomsData?.content || [];

  const [confirmServiceUsage, { isLoading: isConfirming }] =
    useConfirmServiceUsageMutation();

  // Reset trang khi đổi bộ lọc
  useEffect(() => {
    setPage(0);
  }, [selectedHouseId, debouncedKeyword]);

  // --- Handlers ---
  const handleOpenInvoiceListDialog = (roomId) =>
    setInvoiceListDialog({ open: true, roomId });
  const handleOpenCreateInvoiceConfirm = (roomId) => {
    setRoomIdForInvoice(roomId);
    setIsInvoiceCreateConfirmOpen(true);
  };
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
        `${t("ConfirmAllIndexesForMonth")} ${currentMonth}/${currentYear}?`
      )
    )
      return;

    try {
      await confirmServiceUsage({
        month: currentMonth,
        year: currentYear,
      }).unwrap();
      toast.success(
        `${t("ConfirmedAllIndexesForMonth")} ${currentMonth}/${currentYear}!`
      );
    } catch (error) {
      toast.error(error.data?.message || t("ConfirmIndexFailed"));
    }
  };

  return (
    <div className="px-4 lg:px-6 space-y-6">
      {/* Dialogs */}
      <InvoiceCreateConfirmDialog
        roomId={roomIdForInvoice}
        open={isInvoiceCreateConfirmOpen}
        onOpenChange={setIsInvoiceCreateConfirmOpen}
      />
      <InvoiceListDialog
        roomId={invoiceListDialog.roomId}
        open={invoiceListDialog.open}
        onOpenChange={(val) => setInvoiceListDialog(val)}
      />
      <ServiceUsageDeclareDialog
        open={isDeclareDialogOpen}
        onOpenChange={setIsDeclareDialogOpen}
        roomId={selectedRoomIdForDeclare}
      />
      <ServiceUsageViewDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        roomId={selectedRoomForView?.id}
        roomName={selectedRoomForView?.code}
      />

      {/* 🚨 BỘ LỌC HÀNG NGANG */}
      <Card>
        <CardContent className={"py-0"}>
          <div className="grid grid-cols-2 relative">
            <Tooltip>
              <TooltipTrigger className="gap-2 absolute -top-4 right-0">
                <FilterX
                  size={16}
                  onClick={() => {
                    setSelectedHouseId("all");
                    setSearchKeyword("");
                  }}
                  className="hover:text-red-500"
                />
              </TooltipTrigger>
              <TooltipContent>{t("ResetFilter")}</TooltipContent>
            </Tooltip>

            <div className="grid-cols-1 space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                <Home size={14} /> {t("House")}
              </label>
              <Select
                value={selectedHouseId}
                onValueChange={setSelectedHouseId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("SelectHouse")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("AllHouse")}</SelectItem>
                  {allHouses.map((h) => (
                    <SelectItem key={h.id} value={h.id.toString()}>
                      {h.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid-cols-1 space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                <Search size={14} /> {t("SearchRoomCode")}
              </label>
              <div className="relative">
                <Input
                  placeholder={t("EnterRoomCode")}
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="pl-9"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Header Action */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-muted-foreground">
          {t("RentedRoomList")} ({roomsData?.totalElements || 0})
        </h2>
        <Button
          onClick={handleConfirmAll}
          disabled={isConfirming || roomsToDisplay.length === 0}
          className="gap-2 bg-green-600 hover:bg-green-700"
        >
          {isConfirming ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          {t("ConfirmAllIndexes")}
        </Button>
      </div>

      <div className="w-full p-1 rounded-lg border border-purple-200 shadow-md bg-sidebar overflow-hidden">
        <Table>
          <TableHeader className="bg-sidebar/50">
            <TableRow>
              <TableHead className="w-[60px]">{t("No")}</TableHead>
              <TableHead>{t("Room")}</TableHead>
              <TableHead>{t("RentPrice")}</TableHead>
              <TableHead>{t("Status")}</TableHead>
              <TableHead className="text-right w-[100px]">
                {t("Action")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading || isFetching ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20">
                  <Spinner className="mx-auto size-10" />
                </TableCell>
              </TableRow>
            ) : roomsToDisplay.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-20 text-muted-foreground italic"
                >
                  {t("NoRentedRoomsFound")}
                </TableCell>
              </TableRow>
            ) : (
              roomsToDisplay.map((room, index) => (
                <TableRow
                  key={room.id}
                  className="hover:bg-sidebar/50 transition-colors"
                >
                  <TableCell className="font-medium text-muted-foreground">
                    {page * 20 + index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-primary">{room.code}</div>
                    <div className="text-[10px] text-muted-foreground uppercase">
                      {room.houseName || ""}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-muted-foreground">
                    {formatCurrency(room.rent)}
                  </TableCell>
                  <TableCell>
                    <RoomStatusBadge status={room.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="block lg:hidden">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <EllipsisVertical className="size-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuGroup>
                            <DropdownMenuItem
                              onClick={() => handleOpenDeclareDialog(room.id)}
                            >
                              {t("DeclareServiceRecord")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleOpenViewDialog(room)}
                            >
                              {t("ViewIndexes")}
                            </DropdownMenuItem>
                            <hr className="my-1" />
                            <DropdownMenuItem
                              onClick={() =>
                                handleOpenInvoiceListDialog(room.id)
                              }
                            >
                              {t("ViewInvoice")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="font-medium"
                              onClick={() =>
                                handleOpenCreateInvoiceConfirm(room.id)
                              }
                            >
                              {t("CreateInvoice")}
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="hidden lg:flex lg:items-center lg:gap-2">
                      <Tooltip>
                        <TooltipTrigger>
                          <Button
                            variant={"outline"}
                            size={"icon"}
                            onClick={() => handleOpenDeclareDialog(room.id)}
                          >
                            <PencilRuler className="text-yellow-500" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {t("DeclareServiceRecord")}
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger>
                          <Button
                            variant={"outline"}
                            size={"icon"}
                            onClick={() => handleOpenViewDialog(room)}
                          >
                            <Eye className="text-blue-500" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t("ViewIndexes")}</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger>
                          <Button
                            variant={"outline"}
                            size={"icon"}
                            onClick={() => handleOpenInvoiceListDialog(room.id)}
                          >
                            <ReceiptText className="text-green-500" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t("ViewInvoice")}</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger>
                          <Button
                            variant={"outline"}
                            size={"icon"}
                            onClick={() =>
                              handleOpenCreateInvoiceConfirm(room.id)
                            }
                          >
                            <FilePlus className="text-violet-500" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t("CreateInvoice")}</TooltipContent>
                      </Tooltip>
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

export default ServiceListRoomRent;

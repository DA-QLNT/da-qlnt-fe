import { Button } from "@/components/ui/button";
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
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Eye, Plus, SquarePen, Trash } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetRoomByIdQuery,
  useUpdateRoomStatusMutation,
} from "../../store/roomApi";
import RoomStatusBadge from "../../components/Room/RoomStatusBadge";
import { Spinner } from "@/components/ui/spinner";
import Autoplay from "embla-carousel-autoplay";
import { Card } from "@/components/ui/card";
import RoomDeleteConfirm from "../../components/Room/RoomDeleteConfirm";
import RoomEditDialog from "../../components/Room/RoomEditDialog";
import toast from "react-hot-toast";
import AssetItemStatusToggle from "../../components/Room/AssetItemStatusToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AssetItemsViewDialog from "../../components/Asset/AssetItemsViewDialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AssetImageViewer } from "@/components/common/ImageViewer";
import AssetItemEditDialog from "../../components/Room/AssetItemEditDialog";
import AssetItemAddDialog from "../../components/Room/AssetItemAddDialog";
import { formatCurrency } from "@/lib/format/currencyFormat";
const RoomDetailOwner = () => {
  const navigate = useNavigate();
  const { houseId, roomId } = useParams();

  const {
    data: room,
    isLoading,
    isFetching,
    isError,
  } = useGetRoomByIdQuery(roomId, {
    skip: !roomId,
  });
  const [updateStatus, { isLoading: isStatusUpdating }] =
    useUpdateRoomStatusMutation();
  const currentStatus = room?.status;
  const isAvailable = currentStatus === 0;
  const handleStatusToggle = async (checked) => {
    const newStatus = checked ? 1 : 0;
    const toastId = toast.loading("Updating status...");

    try {
      await updateStatus({
        roomId: room.id,
        status: newStatus,
      }).unwrap();
      toast.success("Update status successfully", { id: toastId });
    } catch (error) {
      console.error(error);
    }
  };

  // delete
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    roomId: null,
  });
  // edit room
  const [editDialog, setEditDialog] = useState({
    open: false,
    roomId: null,
  });

  // images room
  const allRoomImages = useMemo(() => {
    if (!room) return [];
    const images = [];
    if (room.avatarUrl) {
      images.push(room.avatarUrl);
    }
    if (room.images && room.images.length > 0) {
      images.push(...room.images);
    }
    return images;
  }, [room]);

  //====assets=========
  const rawAssetsWithItems = room?.assetItems || []
  const sortedAssetsWithItems = useMemo(() => {
    return [...rawAssetsWithItems].sort((a, b) => {
      const nameA = a.assetName.toLowerCase();
      const nameB = b.assetName.toLowerCase();
      return nameA.localeCompare(nameB, "vi", { sensitivity: "base" });
    });
  }, [rawAssetsWithItems]);

  //edit item asset=========
  const [editItemDialog, setEditItemDialog] = useState({
    open: false,
    initialData: null,
  });
  // add item asset
  const [addItemDialog, setAddItemDialog] = useState({
    open: false,
    roomId: null,
  });
  // ========carousel=======
  const plugin = useRef(
    Autoplay({
      delay: 3000,
      disableOnInteraction: false,
    })
  );

  const [apiCarousel, setApiCarousel] = useState();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [totalSlide, setTotalSlide] = useState(0);

  useEffect(() => {
    if (!apiCarousel) return;

    setTotalSlide(apiCarousel.scrollSnapList().length);
    setCurrentSlide(apiCarousel.selectedScrollSnap() + 1);

    const onSelect = () => {
      setCurrentSlide(apiCarousel.selectedScrollSnap() + 1);
    };

    apiCarousel.on("select", onSelect);
    apiCarousel.on("reInit", onSelect);

    // Cleanup function để hủy đăng ký sự kiện khi component unmount
    return () => {
      apiCarousel.off("select", onSelect);
      apiCarousel.off("reInit", onSelect);
    };
  }, [apiCarousel]);

  // ===handle=========
  const backToHouseDetail = () => {
    navigate(-1);
  };
  const openEditDialog = () => {
    setEditDialog({
      open: true,
      roomId: room.id,
    });
  };
  const closeEditDialog = () => {
    setEditDialog({
      open: false,
      roomId: null,
    });
  };
  //  Edit Item
  const openEditItemDialog = (item) => {
    setEditItemDialog({
      open: true,
      initialData: item,
    });
  };
  const closeEditItemDialog = (open) => {
    if (!open) {
      setEditItemDialog({ open: false, initialData: null });
    }
  }; // Add Item
  // Hàm mở Dialog Add Item
  const openAddAssetItemDialog = () => {
    setAddItemDialog({
      open: true,
      roomId: room.id,
    });
  };
  const closeAddItemDialog = (open) => {
    if (!open) {
      setAddItemDialog({ open: false, roomId: null });
    }
  };

  // ================UI========
  if (isLoading || isFetching) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <Spinner className="size-20 text-primary" />
      </div>
    );
  } else if (isError || !room) {
    return <div className="text-center"> No room found</div>;
  }

  // log
  return (
    <div className="px-4 lg:px-6">
      {/* Dialogs */}
      <AssetItemAddDialog
        roomId={room.id}
        open={addItemDialog.open}
        onOpenChange={closeAddItemDialog}
      />

      <AssetItemEditDialog
        open={editItemDialog.open}
        onOpenChange={closeEditItemDialog}
        initialData={editItemDialog.initialData}
      />
      <RoomDeleteConfirm
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog((prev) => ({
            ...prev,
            roomId: open ? prev.roomId : null,
          }))
        }
        roomId={deleteDialog.roomId}
      />
      <RoomEditDialog
        roomId={room.id}
        open={editDialog.open}
        onOpenChange={closeEditDialog}
      />
      {/* End Dialogs */}
      <div className="flex flex-col items-center gap-4 lg:flex-row">
        <div className="flex flex-col w-full lg:w-1/2">
          <div className="flex justify-between items-center mb-4">
            <Button variant="outline" onClick={backToHouseDetail}>
              <ArrowLeft />
              Back
            </Button>
            <div className="flex  gap-4">
              <Button onClick={openEditDialog}>Sửa</Button>
              <Button variant="destructive">Xóa</Button>
              {/* <Button onClick={openEditDialog}>Sửa</Button>
                  <Button onClick={openDeleteDialog} variant="destructive">
                    Xóa
                  </Button> */}
            </div>
          </div>
          <div className="w-full p-1 rounded-lg border border-purple-300 shadow-md shadow-secondary">
            <Table>
              <TableHeader className={"bg-sidebar"}>
                <TableRow>
                  <TableHead className={"w-[150px]"}>Info</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Id room</TableCell>
                  <TableCell>{room.id}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>{room.code}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Floor</TableCell>
                  <TableCell>{room.floor}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Max People</TableCell>
                  <TableCell>{room.maxPeople}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Price</TableCell>
                  <TableCell>{formatCurrency(room.rent)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Area</TableCell>
                  <TableCell>{room.area}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Status</TableCell>
                  <TableCell className={"flex items-center justify-between"}>
                    <RoomStatusBadge status={room.status} />
                    <Switch
                      checked={!isAvailable}
                      onCheckedChange={handleStatusToggle}
                      disabled={isStatusUpdating}
                      title={
                        isStatusUpdating
                          ? "Đang cập nhật..."
                          : `Chuyển sang ${isAvailable ? "Đã thuê" : "Trống"}`
                      }
                    />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>Description</TableCell>
                  <TableCell>
                    <div className="flex justify-between">
                      {room.description}
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={!allRoomImages}
                          >
                            <Eye
                              className={`w-4 h-4 ${
                                allRoomImages.length > 0
                                  ? "text-primary"
                                  : "text-muted-foreground"
                              }`}
                            />
                          </Button>
                        </PopoverTrigger>
                        {allRoomImages.length > 0 && (
                          <PopoverContent
                            className="w-auto p-0 border-none shadow-2xl"
                            onPointerDownOutside={(e) => e.preventDefault()}
                          >
                            <div className="w-full max-w-xs flex items-center justify-center">
                              <Carousel
                                plugins={[plugin.current]}
                                className={"w-full lg:w-2/3"}
                                onMouseEnter={plugin.current.stop}
                                onMouseLeave={plugin.current.reset}
                                opts={{
                                  loop: true,
                                }}
                                setApi={setApiCarousel}
                              >
                                <CarouselContent
                                  className={"flex p-1 aspect-square"}
                                >
                                  {allRoomImages.map((image, index) => (
                                    <CarouselItem key={index}>
                                      <Card className={"p-1"}>
                                        <img
                                          src={image}
                                          alt={room.code}
                                          className="w-full h-full flex rounded-xl object-contain"
                                        />
                                      </Card>
                                    </CarouselItem>
                                  ))}
                                </CarouselContent>
                                <CarouselPrevious className={'left-1'}/>
                                <CarouselNext className={'right-1'}/>
                              </Carousel>
                            </div>
                          </PopoverContent>
                        )}
                      </Popover>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      {/* Assets */}
      <div className="flex flex-col mt-2 lg:mt-20 w-full">
        <h2>Assets</h2>
        <div className="flex gap-4 justify-between items-start">
          <div className="w-full lg:w-1/2 p-1 rounded-lg border border-purple-300 shadow-md shadow-secondary">
            <Table>
              <TableHeader className={"bg-sidebar"}>
                <TableRow>
                  <TableHead className={"w-[150px]"}>Item</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="flex justify-end items-center">
                    <Button
                      variant={"outline"}
                      onClick={openAddAssetItemDialog}
                    >
                      <Plus />
                      Add Item
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAssetsWithItems.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className={"text-center text-muted-foreground"}
                    >
                      No items
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedAssetsWithItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className={"font-semibold"}>
                        {item.assetName}
                      </TableCell>
                      <TableCell className={"font-semibold"}>
                        {item.description}
                      </TableCell>
                      <TableCell className={"font-semibold"}>
                        <AssetItemStatusToggle item={item} />
                      </TableCell>
                      <TableCell className={"flex justify-end"}>
                        <div className="flex items-center">
                          <div
                            className="flex"
                            onClick={() => openEditItemDialog(item)}
                          >
                            <SquarePen className="" size={"16"} />
                          </div>
                          <div className="flex ">
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
                                <PopoverContent
                                  className="w-auto p-0 border-none bg-transparent shadow-2xl"
                                  onPointerDownOutside={(e) =>
                                    e.preventDefault()
                                  }
                                >
                                  <AssetImageViewer imageUrl={item.imageUrl} />
                                </PopoverContent>
                              )}
                            </Popover>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetailOwner;

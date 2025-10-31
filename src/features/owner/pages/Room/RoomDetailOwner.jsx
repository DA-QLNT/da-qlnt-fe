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
import { ArrowLeft, Eye, Plus } from "lucide-react";
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
  // edit
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
  const [selectedAssetImageUrl, setSelectedAssetImageUrl] = useState(null);
  const assetsWithItems = useMemo(() => {
    return room?.assetItems || [];
  }, [room]);
  const handleViewAssetImage = (imageUrl) => {
    setSelectedAssetImageUrl(imageUrl);
  };

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
          <div className="w-full rounded-lg border shadow-md shadow-secondary">
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
                  <TableCell>{room.rent}</TableCell>
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
                  <TableCell>{room.description}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="flex flex-col gap-y-1 w-full max-w-2/3 items-center lg:w-1/2 relative">
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
            <CarouselContent className={"flex p-1 aspect-square"}>
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
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
          {/* {allRoomImages.length > 0 && (
            <div className="absolute bottom-18 lg:bottom-14 xl:bottom-18 text-muted-foreground">
              {currentSlide}/{totalSlide}
            </div>
          )} */}
        </div>
      </div>
      {/* Assets */}
      <div className="flex flex-col mt-2 lg:mt-20 w-full">
        <h2>Assets</h2>
        <div className="flex gap-4 justify-between items-start">
          <div className="w-2/3 lg:w-1/2 rounded-lg border shadow-md shadow-secondary">
            <Table>
              <TableHeader className={"bg-sidebar"}>
                <TableRow>
                  <TableHead className={"w-[150px]"}>Item</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="flex justify-end">
                    <Button variant={"outline"}>
                      <Plus />
                      Add Item
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assetsWithItems.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className={"text-center text-muted-foreground"}
                    >
                      No items
                    </TableCell>
                  </TableRow>
                ) : (
                  assetsWithItems.map((item) => (
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
                        <Button
                          variant={"secondary"}
                          size="icon"
                          onClick={() =>
                            item.imageUrl && handleViewAssetImage(item.imageUrl)
                          }
                          disabled={!item.imageUrl}
                          title={item.imageUrl ? "View image" : "No image"}
                        >
                          <Eye
                            className={
                              item.imageUrl
                                ? "text-primary"
                                : "text-muted-foreground"
                            }
                          />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex w-1/3 lg:w-1/2 justify-center">
            <Card className={"p-1 w-full lg:w-1/2"}>
              {selectedAssetImageUrl ? (
                <img
                  src={selectedAssetImageUrl}
                  alt="asset preview"
                  className="w-full object-cover rounded-md"
                />
              ) : (
                <div className="flex">press eye icon to view image</div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetailOwner;

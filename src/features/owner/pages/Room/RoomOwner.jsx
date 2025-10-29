import React, { useState } from "react";
import RoomCard from "../../components/Room/RoomCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetRoomsByHouseIdQuery } from "../../store/roomApi";
import { Spinner } from "@/components/ui/spinner";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const RoomOwner = () => {
  const { houseId } = useParams();
  const id = Number(houseId);
  const navigate = useNavigate();
  const [page, setPage] = useState(0);

  const { data, isLoading, isFetching, isError } = useGetRoomsByHouseIdQuery(
    {
      houseId: id,
      page,
      size: 10,
    },
    {
      skip: !id,
    }
  );
  const rooms = data?.content || [];
  const totalElements = data?.totalElements || 0;
  const totalPages = data?.totalPages || 0;

  // handle =============
  const backToHouseDetail = () => {
    navigate(`/owner/houses/${houseId}`);
  };
  return (
    <div className="px-4 lg:px-6">
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <Button variant={"outline"} onClick={backToHouseDetail}>
            <ArrowLeft /> Back
          </Button>

          <Button>
            <Plus />
            Add Room
          </Button>
        </div>
        {isError && (
          <div className="text-center p-8 text-muted-foreground">
            Loi tai danh sach phong
          </div>
        )}
        {rooms.length === 0 && (
          <div className="text-center p-8 text-muted-foreground">
            Nhà này chưa có phòng nào được tạo.
          </div>
        )}
        {(isLoading || isFetching) && <Spinner className={"size-10"} />}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} houseId={houseId}/>
          ))}
        </div>
        {totalPages > 1 && (
          <Pagination className={"mt-4 flex"}>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                ></PaginationPrevious>
              </PaginationItem>
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    onClick={() => setPage(i)}
                    isActive={i === page}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  disabled={page === totalPages - 1}
                  onClick={() =>
                    setPage((p) => Math.min(totalPages - 1, p + 1))
                  }
                ></PaginationNext>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
};

export default RoomOwner;

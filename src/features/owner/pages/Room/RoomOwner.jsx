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
// const rooms = [
//   {
//     id: 3,
//     houseId: 13,
//     code: "p207",
//     floor: 2,
//     maxPeople: 5,
//     rent: 2400000.0,
//     area: 35.0,
//     status: 1,
//     description: "phòng vskk, dngd",
//     avatarUrl:
//       "http://res.cloudinary.com/dumrmr6xa/image/upload/v1761556323/general/fz1w6mox7zvxudxukrar.jpg",
//     images: [
//       "http://res.cloudinary.com/dumrmr6xa/image/upload/v1761556327/general/dvuhlwwfopfehl2yewep.jpg",
//       "http://res.cloudinary.com/dumrmr6xa/image/upload/v1761556331/general/wz8h2chr2zm06jjtp3wz.jpg",
//     ],
//   },
//   {
//     id: 2,
//     houseId: 13,
//     code: "p205",
//     floor: 2,
//     maxPeople: 4,
//     rent: 2000000.0,
//     area: 30.0,
//     status: 0,
//     description: "phòng vskk, dngd",
//     avatarUrl:
//       "http://res.cloudinary.com/dumrmr6xa/image/upload/v1761555549/general/ftkn9brjwxgqi3a7dkwo.webp",
//     images: [
//       "http://res.cloudinary.com/dumrmr6xa/image/upload/v1761555558/general/iiv288uv2rcrh8ojkyql.webp",
//     ],
//   },
// ];
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
        {(isLoading || isFetching) && <Spinner className={"size-10"} />}
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

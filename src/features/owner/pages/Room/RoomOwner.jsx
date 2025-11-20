import React, { useEffect, useMemo, useState } from "react";
import RoomCard from "../../components/Room/RoomCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, Filter, FunnelPlus, Plus } from "lucide-react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
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
import RoomAddDialog from "../../components/Room/RoomAddDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sortRoomOptions } from "@/assets/sort/sortRoom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import RoomStatusBadge from "../../components/Room/RoomStatusBadge";
import { formatCurrency } from "@/lib/format/currencyFormat";
import { useTranslation } from "react-i18next";
const RoomOwner = () => {
  const { t } = useTranslation("house");
  const { houseId } = useParams();
  const id = Number(houseId);
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const {
    data: allRoomsData,
    isLoading: loadingAllRooms,
    isFetching: fetchingAllRooms,
    isError,
  } = useGetRoomsByHouseIdQuery(
    {
      houseId: id,
      page: 0,
      size: 100,
    },
    {
      skip: !id,
    }
  );

  const [currentSort, setCurrentSort] = useState("none");
  const allRooms = allRoomsData?.content || [];
  // initial sort by name
  const sortedRoomByName = useMemo(() => {
    return [...allRooms].sort((a, b) => {
      const nameA = a.code.toLowerCase();
      const nameB = b.code.toLowerCase();
      return nameA.localeCompare(nameB, "vi", { sensitivity: "base" });
    });
  }, [allRooms]);

  const filteredAndSortedRooms = useMemo(() => {
    let list = [...sortedRoomByName];
    const sortSetting = sortRoomOptions.find(
      (option) => option.value === currentSort
    );
    if (!sortSetting) return allRooms;
    if (sortSetting.type === "status") {
      const statusFilter = sortSetting.status;
      list = list.filter((room) => room.status === statusFilter);
    }
    if (sortSetting.type === "rent") {
      const field = sortSetting.type;
      list.sort((a, b) => {
        const valA = a[field];
        const valB = b[field];
        let comparision = valA - valB;
        return sortSetting.order === "asc" ? comparision : comparision * -1;
      });
    }
    return list;
  }, [allRooms, currentSort]);

  // pagination
  const totalFilteredElements = filteredAndSortedRooms.length;
  const totalPages = Math.ceil(totalFilteredElements / pageSize);
  const startIndex = page * pageSize;
  const roomsToDisplay = filteredAndSortedRooms.slice(
    startIndex,
    startIndex + pageSize
  );

  const handleSortChange = (value) => {
    setCurrentSort(value);
    setPage(0);
  };
  useEffect(() => {
    if (page >= totalPages && totalPages > 0) {
      setPage(totalPages - 1);
    } else if (totalPages === 0 && page !== 0) {
      setPage(0);
    }
  }, [totalPages, page]);

  // add
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // handle =============
  const backToHouseDetail = () => {
    navigate(`/owner/houses/${houseId}`);
  };

  // ================UI========
  if (isError) {
    return (
      <div className="text-center p-8 text-red-500">{t("ErrorLoadRoom")}</div>
    );
  }
  return (
    <div className="px-4 lg:px-6">
      {/* initial */}
      {(loadingAllRooms || fetchingAllRooms) && (
        <div className="absolute inset-0 flex items-center justify-center ">
          <Spinner className={"text-primary size-20"} />
        </div>
      )}

      {/* initial */}

      <RoomAddDialog
        houseId={id}
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <Button variant={"outline"} onClick={backToHouseDetail}>
            <ArrowLeft /> {t("Back")}
          </Button>

          <div className="flex items-center gap-x-2">
            <Select
              value={currentSort}
              onValueChange={handleSortChange}
              disabled={loadingAllRooms || fetchingAllRooms}
            >
              <SelectTrigger
                className={"w-[150px] md:w-[200px] tracking-wider"}
              >
                <FunnelPlus size={24} />
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                {sortRoomOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className={"flex items-center"}
                  >
                    {t(option.label)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus />
              <span className="hidden md:block">{t("AddRoom")}</span>
            </Button>
          </div>
        </div>
        <div className="w-full  p-1 rounded-lg border border-purple-300 shadow-md shadow-secondary">
          <Table>
            <TableHeader className={"bg-sidebar"}>
              <TableRow>
                <TableHead className="w-[50px]">{t("No")}</TableHead>
                <TableHead className={""}>{t("Room")}</TableHead>
                <TableHead className={""}>{t("Price")}</TableHead>
                <TableHead className={""}>{t("Status")}</TableHead>
                <TableHead className="text-right w-[100px]">
                  {t("Action")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roomsToDisplay.length === 0 && !loadingAllRooms ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground"
                  >
                    {t("NoRoom")}
                  </TableCell>
                </TableRow>
              ) : (
                roomsToDisplay.map((room, index) => (
                  <TableRow key={room.id}>
                    <TableCell className={"w-[50px]"}>{index + 1}</TableCell>
                    <TableCell>
                      <h4 className="font-semibold line-clamp-1">
                        {room.code}
                      </h4>
                    </TableCell>
                    <TableCell className={""}>
                      {formatCurrency(room.rent)}
                    </TableCell>
                    <TableCell>
                      <RoomStatusBadge status={room.status} />
                    </TableCell>
                    <TableCell className={"flex justify-end"}>
                      <Button
                        variant={"outline"}
                        className={
                          "border-purple-400 dark:border-purple-400 hover:border-amber-500 hover:text-amber-500"
                        }
                        asChild
                      >
                        <NavLink
                          to={`/owner/houses/${houseId}/rooms/${room.id}`}
                          className={"flex items-center gap-2"}
                        >
                          <Eye /> {t("View")}
                        </NavLink>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
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

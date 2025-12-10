import React, { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";
import { Eye } from "lucide-react";
import { useAuth } from "@/features/auth";
import { useGetHousesByOwnerIdQuery } from "../../store/houseApi";
const RecordMeter = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const { userId: ownerId, isLoadingMe } = useAuth();
  // get house list
  const {
    data: houseData,
    isLoading: houseLoading,
    isFetching: houseFetching,
    isError: houseError,
  } = useGetHousesByOwnerIdQuery(
    {
      ownerId: ownerId,
      page: 0,
      size: 20,
    },
    {
      skip: !ownerId || isLoadingMe,
    }
  );
  const rawHouses = houseData?.houses || [];
  const sortedHouses = useMemo(() => {
    const housesCopy = [...rawHouses];
    return housesCopy.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      return nameA.localeCompare(nameB, "vi", { sensitivity: "base" });
    });
  }, [rawHouses]);
  return (
    <div className="px-4 lg:px-6">
      <div className="w-full  p-1 rounded-lg border border-purple-300 shadow-md shadow-secondary">
        {/* Cần thay thế bảng danh sách phòng đang thuê tại đây */}
        <Table>
          <TableHeader className={"bg-sidebar"}>
            <TableRow>
              <TableHead className="w-[50px]">STT</TableHead>
              <TableHead>Phòng</TableHead>
              <TableHead>Địa chỉ</TableHead>
              <TableHead className="text-right w-[100px]">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedHouses.length > 0 &&
              sortedHouses.map((house, index) => (
                <TableRow key={house.id}>
                  <TableCell className={"w-[50px]"}>{index + 1}</TableCell>
                  <TableCell>
                    <h4 className="font-semibold text-wrap ">{house.name}</h4>
                  </TableCell>
                  <TableCell className={"hidden sm:table-cell"}>
                    <h4 className="text-muted-foreground text-wrap ">
                      {house.address}-{house.district}-{house.province}
                    </h4>
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
                        to={`/owner/recordmeters/houses/${house.id}/rooms`}
                        className={"flex items-center gap-2"}
                      >
                        <Eye /> Phòng thuê
                      </NavLink>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default RecordMeter;

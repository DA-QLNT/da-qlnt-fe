import React, { useMemo, useState } from "react";
import HouseCard from "../../components/House/HouseCard";
import { useAuth } from "@/features/auth";
import { useGetHousesByOwnerIdQuery } from "../../store/houseApi";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Eye, Plus } from "lucide-react";
import HouseAddDialog from "../../components/House/HouseAddDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NavLink } from "react-router-dom";
const HouseOwner = () => {
  const { userId: ownerId, isLoadingMe } = useAuth();
  console.log(ownerId);
  // add house
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { data, isLoading, isFetching, isError } = useGetHousesByOwnerIdQuery(
    {
      ownerId: ownerId,
      page: 0,
      size: 20,
    },
    {
      skip: !ownerId || isLoadingMe,
    }
  );
  const rawHouses = data?.houses || [];
  const sortedHouses = useMemo(() => {
    const housesCopy = [...rawHouses];
    return housesCopy.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      return nameA.localeCompare(nameB, "vi", { sensitivity: "base" });
    });
  }, [rawHouses]);

  const totalElements = data?.totalElements || 0;
  const totalPages = data?.totalPages || 0;

  return (
    <div className="px-4 lg:px-6">
      {/* initial */}
      {isError && (
        <div className="p-6 text-center text-red-500">
          Lỗi tải danh sách nhà trọ.
        </div>
      )}
      {(isLoading || isFetching) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner className={"size-20 text-primary"} />
        </div>
      )}
      {!isLoading && rawHouses.length === 0 && (
        <div className="text-center p-8 text-muted-foreground">
          Anh chưa có nhà trọ nào được đăng ký.
        </div>
      )}
      {/* initial */}

      <HouseAddDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
      <div className="flex flex-col gap-8">
        <div className="text-end">
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus />
            Add House
          </Button>
        </div>
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedHouses.map((house) => (
            <HouseCard key={house.id} house={house} />
          ))}
        </div> */}
        <div className="w-full lg:w-4/5 p-1 rounded-lg border border-purple-300 shadow-md shadow-secondary">
          <Table>
            <TableHeader className={"bg-sidebar"}>
              <TableRow>
                <TableHead className="w-[50px]">No</TableHead>
                <TableHead className={"w-[250px]"}>House</TableHead>
                <TableHead className={"hidden sm:table-cell"}>
                  Address
                </TableHead>
                <TableHead className="text-right w-[100px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedHouses.length === 0 && !isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground"
                  >
                    Chưa có nhà nào được đăng ký.
                  </TableCell>
                </TableRow>
              ) : (
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
                          to={`/owner/houses/${house.id}`}
                          className={"flex items-center gap-1"}
                        >
                          <Eye /> View
                        </NavLink>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default HouseOwner;

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
import { useTranslation } from "react-i18next";
const HouseOwner = () => {
  const { t } = useTranslation("house");
  const { userId: ownerId, isLoadingMe } = useAuth();
  // console.log(ownerId);
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
          {t("ErrorLoadHouse")}
        </div>
      )}
      {(isLoading || isFetching) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner className={"size-20 text-primary"} />
        </div>
      )}
      {!isLoading && rawHouses.length === 0 && (
        <div className="text-center p-8 text-muted-foreground">
          {t("NoHouse")}
        </div>
      )}
      {/* initial */}

      <HouseAddDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1>{t("ManageHouse")}</h1>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus />
            {t("AddHouse")}
          </Button>
        </div>
        <div className="w-full p-1 rounded-lg border border-purple-300 shadow-md shadow-secondary">
          <Table>
            <TableHeader className={"bg-sidebar"}>
              <TableRow>
                <TableHead className="w-[50px]">{t("No")}</TableHead>
                <TableHead className={"w-[250px]"}>{t("House")}</TableHead>
                <TableHead className={"hidden sm:table-cell"}>
                  {t("Address")}
                </TableHead>
                <TableHead className="text-right w-[100px]">
                  {t("Action")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedHouses.length === 0 && !isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground"
                  >
                    {t("NoHouse")}
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
      </div>
    </div>
  );
};

export default HouseOwner;

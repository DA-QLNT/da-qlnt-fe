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
import React, { useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useGetHouseByIdQuery, useGetRulesQuery } from "../../store/houseApi";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import HouseDeleteConfirm from "../../components/House/HouseDeleteConfirm";
import HouseEditDialog from "../../components/House/HouseEditDialog";

const HouseDetailOwner = () => {
  const { houseId } = useParams();
  const id = Number(houseId);
  const {
    data: house,
    isLoading,
    isFetching,
    isError,
  } = useGetHouseByIdQuery(id, {
    skip: !id,
  });

  // edit
  const [editDialog, setEditDialog] = useState({
    open: false,
    houseId: null,
  });
  // delete
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    houseId: null,
    houseName: "",
  });

  // rules
  const rules = house?.rules || [];

  const sortedRules = useMemo(() => {
    return [...rules].sort((a, b) => {
      const nameA = a.name;
      const nameB = b.name;
      return nameA.localeCompare(nameB, "vi", { sensitivity: "base" });
    });
  }, [rules]);

  // handle==================
  const openDeleteDialog = () => {
    setDeleteDialog({
      open: true,
      houseId: house.id,
      houseName: house.name || house.code,
    });
  };
  const openEditDialog = () => {
    setEditDialog({
      open: true,
      houseId: house.id,
    });
  };

  // ================UI========
  if (isLoading || isFetching) {
    return (
      <div className="text-center">
        <Spinner className="size-10" />
      </div>
    );
  }
  if (isError || !house) {
    return <div className="text-center"> No house found</div>;
  }
  return (
    <div className="px-4 lg:px-6">
      <HouseEditDialog
        open={editDialog.open}
        onOpenChange={(open) => setEditDialog({ ...editDialog, open })}
        houseId={editDialog.houseId}
      />
      <HouseDeleteConfirm
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open }))}
        houseId={deleteDialog.houseId}
        houseName={deleteDialog.houseName}
      />
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="w-full md:w-2/3 order-2 md:order-0 rounded-lg border shadow-md shadow-secondary">
          <Table>
            <TableHeader className={"bg-sidebar"}>
              <TableRow>
                <TableHead className={"w-[150px]"}>Info</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>{house.name}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>{house.code}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Province</TableCell>
                <TableCell>{house.province}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>District</TableCell>
                <TableCell>{house.district}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Address</TableCell>
                <TableCell>{house.address}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Area</TableCell>
                <TableCell>{house.area}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <div className="flex gap-x-2 w-full md:justify-center md:w-1/3 order-1">
          <div className="w-full flex justify-between md:flex-col md:justify-center md:items-center sm:flex-row md:gap-8">
            <Button variant="outline">Danh sách phòng</Button>
            <div className="flex gap-4">
              <Button onClick={openEditDialog}>Sửa</Button>
              <Button onClick={openDeleteDialog} variant="destructive">
                Xóa
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 md:mt-16 w-full rounded-lg border shadow-md shadow-secondary">
        <Table>
          <TableHeader className={"bg-sidebar"}>
            <TableRow>
              <TableHead className={"w-[50px]"}>No</TableHead>
              <TableHead>Rules</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRules.length === 0 && !isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center text-muted-foreground"
                >
                  No Rule
                </TableCell>
              </TableRow>
            ) : (
              sortedRules.map((rule, index) => (
                <TableRow key={rule.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <h4 className="font-semibold line-clamp-1">{rule.name}</h4>
                    <p className="text-muted-foreground text-wrap line-clamp-4">
                      {rule.description}
                    </p>
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

export default HouseDetailOwner;

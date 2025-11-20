import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye } from "lucide-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import ContractAddDialog from "../../components/Contract/ContractAddDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { useGetContractsByRoomIdQuery } from "../../store/contractApi";
import ContractStatusBadge from "../../components/Contract/ContractStatusBadge";

const ContractOwner = () => {
  const { t } = useTranslation("house");
  const { houseId, roomId } = useParams();

  const navigate = useNavigate();
  // const [page, setPage] = useState(0);
  // const [pageSize, setPageSize] = useState(20);
  const {
    data: defaultContractData,
    isLoading: isLoadingContract,
    isError: isErrorContract,
    error,
  } = useGetContractsByRoomIdQuery(
    Number(roomId),

    {
      skip: !roomId,
    }
  );
  const defaultContracts = defaultContractData?.content || [];

  //   add contract
  const [addContractDialog, setAddContractDialog] = useState({
    open: false,
    houseId: Number(houseId),
    roomId: Number(roomId),
  });
  const openAddContractDialog = () => {
    setAddContractDialog((prev) => ({
      ...prev,
      open: true,
      // Cần lấy rentPrice thực tế của phòng {roomId} ở đây
    }));
  };
  const closeAddContractDialog = (open) => {
    if (!open) {
      setAddContractDialog((prev) => ({ ...prev, open: false }));
    }
  };

  // ===========handle=========
  const backToHouseDetail = () => {
    navigate(-1);
  };

  return (
    <div className="px-4 lg:px-6">
      <ContractAddDialog
        houseId={addContractDialog.houseId}
        roomId={addContractDialog.roomId}
        open={addContractDialog.open}
        onOpenChange={closeAddContractDialog}
      />
      <div className="flex flex-col w-full ">
        <div className="flex justify-between items-center mb-4">
          <Button variant="outline" onClick={backToHouseDetail}>
            <ArrowLeft />
            {t("Back")}
          </Button>
          <Button
            onClick={openAddContractDialog}
            variant={"outline"}
            className={
              "border-purple-400 dark:border-purple-400 hover:border-amber-500 hover:text-amber-500"
            }
          >
            {t("Create")}
          </Button>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead colSpan={1}>No</TableHead>
            <TableHead colSpan={2} className="w-[100px]">
              Representative
            </TableHead>
            <TableHead colSpan={2}>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {defaultContracts.map((contract, index) => {
            const representative = contract.tenants?.find(
              (tenant) => tenant.representative === true
            );
            const representativeName = representative?.fullName || "N/A";
            return (
              <TableRow key={contract.id}>
                <TableCell className={"w-[50px]"}>{index + 1}</TableCell>
                <TableCell colSpan={2} className="font-medium">
                  {representativeName}
                </TableCell>
                <TableCell colSpan={2}>
                  <ContractStatusBadge status={contract.status} />
                </TableCell>
                <TableCell className="flex justify-end">
                  <Button
                    variant={"outline"}
                    className={
                      "border-purple-400 dark:border-purple-400 hover:border-amber-500 hover:text-amber-500"
                    }
                    asChild
                  >
                    <NavLink
                      to={`/owner/houses/${houseId}/rooms/${roomId}/contracts/${contract.id}`}
                      className={"flex items-center gap-2"}
                    >
                      <Eye /> {t("View")}
                    </NavLink>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
          {defaultContracts.length === 0 && (
            <TableRow>
              <TableCell colSpan={4}>No contract</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ContractOwner;

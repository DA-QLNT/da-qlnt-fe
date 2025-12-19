import React, { useMemo, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { useGetContractsByHouseIdQuery } from "../../store/contractApi";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslation } from "react-i18next";
import EarlyContractAddDialog from "../../components/Contract/EarlyContractAddDialog";
import ContractStatusBadge from "../../components/Contract/ContractStatusBadge";
const ContractListByHouse = () => {
  const { t } = useTranslation("contractinvoice");
  const { houseId } = useParams();
  const navigate = useNavigate();
  const backToContractList = () => {
    navigate(`/owner/contracts/houses/`);
  };
  const {
    data: contractData,
    isLoading: loadingContract,
    isError: errorContract,
  } = useGetContractsByHouseIdQuery(
    { houseId: houseId, page: 0, size: 20 },
    {
      skip: !houseId,
    }
  );
  const sortedContracts = useMemo(() => {
    if (!contractData) return [];
    return [...contractData].sort((a, b) => {
      const nameA = a.roomName.toLowerCase();
      const nameB = b.roomName.toLowerCase();
      return nameA.localeCompare(nameB, "vi", { sensitivity: "base" });
    });
  });
  const [earlyAddContractDialog, setEarlyAddContractDialog] = useState({
    open: false,
  });
  const openEalryAddContractDialog = () => {
    setEarlyAddContractDialog((prev) => ({
      ...prev,
      open: true,
      // Cần lấy rentPrice thực tế của phòng {roomId} ở đây
    }));
  };
  const closeEalryAddContractDialog = (open) => {
    if (!open) {
      setEarlyAddContractDialog((prev) => ({ ...prev, open: false }));
    }
  };
  if (loadingContract) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <Spinner className="size-20 text-primary" />
      </div>
    );
  }
  if (!loadingContract) {
    console.log(sortedContracts);
  }
  return (
    <div className="px-4 lg:px-6 flex flex-col gap-4">
      <EarlyContractAddDialog
        open={earlyAddContractDialog.open}
        onOpenChange={closeEalryAddContractDialog}
      />
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={backToContractList}
          className={"w-fit"}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> {t("Back")}
        </Button>
        <Button onClick={openEalryAddContractDialog}>
          <Plus />
          {t("CreateContract")}
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className={"w-[50px]"}>{t("No")}</TableHead>
            <TableHead>{t("Room")}</TableHead>
            <TableHead>{t("Representative")}</TableHead>
            <TableHead>{t("Status")}</TableHead>
            <TableHead className={"text-right"}>{t("Method")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedContracts.map((contract, index) => {
            return (
              <TableRow key={contract.id}>
                <TableCell className={"w-[50px]"}>{index + 1}</TableCell>
                <TableCell>{contract.roomName}</TableCell>
                <TableCell>{contract.tenants[0].fullName}</TableCell>
                <TableCell>
                  <ContractStatusBadge contractStatus={contract.status} />
                </TableCell>
                <TableCell className={"text-right"}>
                  <Button
                    variant={"outline"}
                    className={
                      "border-purple-400 dark:border-purple-400 hover:border-amber-500 hover:text-amber-500"
                    }
                    asChild
                  >
                    <NavLink
                      to={`/owner/contracts/houses/${contract.houseId}/contracts/${contract.id}`}
                      className={"flex items-center gap-1"}
                    >
                      <Eye /> {t("View")}
                    </NavLink>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default ContractListByHouse;

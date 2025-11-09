import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import ContractAddDialog from "../../components/Contract/ContractAddDialog";

const ContractOwner = () => {
  const { t } = useTranslation("house");
  const { houseId, roomId } = useParams();

  const navigate = useNavigate();

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
      <div className="flex flex-col w-full lg:w-2/3">
        <div className="flex justify-between items-center mb-4">
          <Button variant="outline" onClick={backToHouseDetail}>
            <ArrowLeft />
            {t("Back")}
          </Button>
          <div className="flex  gap-4">
            <Button>{t("Edit")}</Button>
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
      </div>
    </div>
  );
};

export default ContractOwner;

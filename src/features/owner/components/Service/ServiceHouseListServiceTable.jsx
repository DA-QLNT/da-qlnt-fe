import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetHouseServicesByHouseIdQuery } from "../../store/serviceApi";
import { Spinner } from "@/components/ui/spinner";

import { useState } from "react";
import HouseServiceRow from "./HouseServiceRow";
import { useTranslation } from "react-i18next";
const ServiceHouseListServiceTable = ({ houseId, onFormSubmitSuccess }) => {
  const { t } = useTranslation("service");
  const {
    data: houseServices,
    isLoading,
    isFetching,
  } = useGetHouseServicesByHouseIdQuery(houseId, {
    skip: !houseId,
  });
  const [editingRowId, setEditingRowId] = useState(null);
  if (isLoading || isFetching) {
    return (
      <div className="absoulute inset-0 flex items-center justify-center">
        <Spinner className={"size-14 text-primary"} />
      </div>
    );
  }
  const assignedServices = houseServices || [];

  return (
    <div className="w-full p-1 rounded-lg border border-purple-300 shadow-md shadow-secondary">
      <Table>
        <TableHeader className={"bg-sidebar"}>
          <TableRow>
            <TableHead className="w-[50px]">{t("No")}</TableHead>
            <TableHead>{t("ServiceName")}</TableHead>
            <TableHead>{t("Method")}</TableHead>
            <TableHead>{t("Price")}</TableHead>
            <TableHead>{t("EffectiveDate")}</TableHead>
            <TableHead className="text-right w-[100px]">
              {t("Action")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assignedServices.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className={"text-center"} />
              {t("NoService")}
            </TableRow>
          ) : (
            assignedServices.map((houseService, index) => (
              <HouseServiceRow
                key={houseService.id}
                houseService={houseService}
                index={index}
                disabledEdit={
                  editingRowId !== null && editingRowId !== houseService.id
                }
                startEditing={() => setEditingRowId(houseService.id)}
                stopEditing={() => setEditingRowId(null)}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ServiceHouseListServiceTable;

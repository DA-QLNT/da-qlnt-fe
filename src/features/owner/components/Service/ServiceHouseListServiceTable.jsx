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
import { formatCurrency } from "@/lib/format/currencyFormat";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { METHOD_OPTIONS } from "@/assets/service/methodOptions";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import HouseServiceRow from "./HouseServiceRow";
const ServiceHouseListServiceTable = ({ houseId, onFormSubmitSuccess }) => {
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
        <Spinner className={"size-14"} />
      </div>
    );
  }
  const assignedServices = houseServices || [];

  return (
    <div className="w-full p-1 rounded-lg border border-purple-300 shadow-md shadow-secondary">
      <Table>
        <TableHeader className={"bg-sidebar"}>
          <TableRow>
            <TableHead className="w-[50px]">No</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>EffectiveDate</TableHead>
            <TableHead className="text-right w-[100px]">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assignedServices.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className={"text-center"} />
              No services{" "}
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

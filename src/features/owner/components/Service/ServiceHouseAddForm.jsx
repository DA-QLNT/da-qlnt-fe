import React from "react";
import toast from "react-hot-toast";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/features/auth";
import { useGetHousesByOwnerIdQuery } from "../../store/houseApi";
const ServiceHouseAddForm = ({ serviceId, onFormSubmitSuccess }) => {
  const { userId: ownerId, isLoadingMe } = useAuth();

  const { data:houseData, isLoading, isFetching, isError } =
    useGetHousesByOwnerIdQuery(
      {
        ownerId: ownerId,
        page: 0,
        size: 10,
      },
      {
        skip: !ownerId || isLoadingMe,
      }
    );
  const rawHouses = houseData?.houses || [];
  console.log(rawHouses);
  console.log(ownerId);

  return (
    <form>
      <FieldGroup>
        <div className="grid grid-cols-2 lg:grid-cols-3">
          <Field>
            <FieldLabel>Method</FieldLabel>
            {/* <Controller/> */}
          </Field>
          <Field>
            <FieldLabel>Price</FieldLabel>
            <Input placeholder="enter price" />
          </Field>
          <Field>
            <FieldLabel>EffectiveDate</FieldLabel>
            {/* <Controller/> */}
          </Field>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>House</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>EffectiveDate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rawHouses.map((house) => (
              <TableRow key={house.id}>
                <TableCell>
                  <Checkbox />
                </TableCell>
                <TableCell>
                  {house.name}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </FieldGroup>
    </form>
  );
};

export default ServiceHouseAddForm;

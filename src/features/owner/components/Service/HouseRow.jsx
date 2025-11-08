import React from 'react'
import { useHouseServiceData } from '../../hooks/useHouseServiceData'
import { formatCurrency } from '@/lib/format/currencyFormat';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Spinner } from '@/components/ui/spinner';
import { Checkbox } from '@/components/ui/checkbox';
import MethodBadge from './MethodBadge';
const HouseRow = ({
  house,
  serviceId,
  isChecked,
  onCheckedChange,
  disabled,
}) => {
  const { price, effectiveDate, method, isLoading } = useHouseServiceData(
    house.id,
    serviceId
  );

  const displayPrice = price ? formatCurrency(price) : "N/A";
  const displayDate = effectiveDate || "N/A";
  return (
    <TableRow>
      <TableCell>
        <Checkbox
          checked={isChecked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
        />
      </TableCell>
      <TableCell>{house.name}</TableCell>
      <TableCell>
        {isLoading ? <Spinner className="size-4" /> : displayPrice}  <MethodBadge methodValue={Number(method)}/>
      </TableCell>
      <TableCell>
        {isLoading ? <Spinner className="size-4" /> : displayDate}
      </TableCell>
    </TableRow>
  );
};

export default HouseRow
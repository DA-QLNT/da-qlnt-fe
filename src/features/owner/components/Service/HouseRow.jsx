import React from 'react'
import {
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from '@/components/ui/checkbox';

const HouseRow = ({
  house,
  isChecked,
  onCheckedChange,
  disabled,
}) => {
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
      <TableCell>{house.address}</TableCell>
    </TableRow>
  );
};

export default HouseRow
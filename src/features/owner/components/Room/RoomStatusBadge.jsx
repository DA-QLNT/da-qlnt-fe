import { Badge } from "@/components/ui/badge";
import React from "react";

const RoomStatusBadge = ({ status }) => {
  let color;
  let statusName = "Rent";
  let variant = "secondary";
  if (status === 0) {
    color = "text-green-500";
    statusName = "Available";
    variant = "outline";
  }
  return (
    <Badge variant={variant} className={color}>
      {statusName}
    </Badge>
  );
};

export default RoomStatusBadge;

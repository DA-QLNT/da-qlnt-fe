import { Badge } from "@/components/ui/badge";
import React from "react";

const RoomStatusBadge = ({ status }) => {
  let color;
  let statusName;
  let variant;
  if (status === 0) {
    color = "text-green-500";
    statusName = "Available";
    variant = "outline";
  } else if (status === 1) {
    statusName = "Rent";
    variant = "secondary";
  }
  return (
    <Badge variant={variant} className={color}>
      {statusName}
    </Badge>
  );
};

export default RoomStatusBadge;

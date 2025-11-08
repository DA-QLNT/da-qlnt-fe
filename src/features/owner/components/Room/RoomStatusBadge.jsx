import { Badge } from "@/components/ui/badge";
import React from "react";
import { useTranslation } from "react-i18next";

const RoomStatusBadge = ({ status }) => {
  const { t } = useTranslation("house");
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
      {t(statusName)}
    </Badge>
  );
};

export default RoomStatusBadge;

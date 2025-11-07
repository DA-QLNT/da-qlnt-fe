import { Badge } from "@/components/ui/badge";
import React from "react";

// Định nghĩa các loại tính tiền
const TYPE_MAP = {
  0: { label: "Theo Công tơ", variant: "outline" },
  1: { label: "Theo Đầu người", variant: "secondary" },
  2: { label: "Theo Phòng", variant: "ghost" },
};
const ServiceTypeBadge = ({ type }) => {
  const info = TYPE_MAP[type] || { label: "N/A", variant: "default" };
  return <Badge variant={info.variant}>{info.label}</Badge>;
};

export default ServiceTypeBadge;

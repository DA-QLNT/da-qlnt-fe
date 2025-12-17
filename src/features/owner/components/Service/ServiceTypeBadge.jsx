import { Badge } from "@/components/ui/badge";
import React from "react";
import { useTranslation } from "react-i18next";

// Định nghĩa các loại tính tiền
const TYPE_MAP = {
  0: { label: "ByMeter", variant: "outline" },
  1: { label: "ByPerson", variant: "secondary" },
  2: { label: "ByRoom", variant: "ghost" },
};
const ServiceTypeBadge = ({ type }) => {
  const { t } = useTranslation("service");
  const info = TYPE_MAP[type] || { label: "N/A", variant: "default" };
  return <Badge variant={info.variant}>{t(`${info.label}`)}</Badge>;
};

export default ServiceTypeBadge;

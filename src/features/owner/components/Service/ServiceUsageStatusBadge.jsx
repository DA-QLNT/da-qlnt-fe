// src/components/Service/ServiceUsageStatusBadge.jsx (Ví dụ)
import { Badge } from "@/components/ui/badge";
import React from "react";
import { useTranslation } from "react-i18next";

const ServiceUsageStatusBadge = ({ status }) => {
  const { t } = useTranslation("service");
  switch (status) {
    case 0:
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
          {t("ConfirmWait")}
        </Badge>
      );
    case 1:
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800">
          {t("Confirmed")}
        </Badge>
      );
    default:
      return <Badge variant="outline">N/A</Badge>;
  }
};

export default ServiceUsageStatusBadge;

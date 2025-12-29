import { Badge } from "@/components/ui/badge";
import React from "react";
import { useTranslation } from "react-i18next";

const InvoiceStatusBadge = ({ status }) => {
  const { t } = useTranslation("service");
  switch (status) {
    case 0:
      return (
        <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-none">
          {t("Unpaid")}
        </Badge>
      );
    case 1:
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">
          {t("Paid")}
        </Badge>
      );
    case 2:
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none">
          {t("Overdue")}
        </Badge>
      );
    case 3:
      return (
        <Badge variant="secondary" className="border-none">
          {t("OverduePaid")}
        </Badge>
      );
    default:
      return <Badge>N/A</Badge>;
  }
};

export default InvoiceStatusBadge;

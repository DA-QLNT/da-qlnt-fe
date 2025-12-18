import { CONTRACT_STATUS_MAP } from "@/assets/contract/contractStatus";
import { Badge } from "@/components/ui/badge";
import React from "react";
import { useTranslation } from "react-i18next";

const ContractStatusBadge = ({ contractStatus }) => {
  const { t } = useTranslation("contractinvoice");
  const statusInfo =
    CONTRACT_STATUS_MAP[contractStatus] || CONTRACT_STATUS_MAP[0];
  const { label, color } = statusInfo;
  return (
    <Badge className={`uppercase text-muted-foreground ${color}`}>
      {t(`${label}`)}
    </Badge>
  );
};

export default ContractStatusBadge;

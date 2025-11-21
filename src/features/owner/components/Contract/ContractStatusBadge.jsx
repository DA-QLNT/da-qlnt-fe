import { CONTRACT_STATUS_MAP } from "@/assets/contract/contractStatus";
import { Badge } from "@/components/ui/badge";
import React from "react";

const ContractStatusBadge = ({ contractStatus }) => {
  const statusInfo =
    CONTRACT_STATUS_MAP[contractStatus] || CONTRACT_STATUS_MAP[0];
  const { label, color } = statusInfo;
  return (
    <Badge className={`uppercase text-muted-foreground ${color}`}>
      {label}
    </Badge>
  );
};

export default ContractStatusBadge;

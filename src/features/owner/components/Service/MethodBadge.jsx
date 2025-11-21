import React from "react";
import { Badge } from "@/components/ui/badge";

export const BADGE_METHOD_OPTIONS = [
  { value: 0, label: "kWh or m\u00B3" },
  { value: 1, label: "persion" },
  { value: 2, label: "room" },
];

const MethodBadge = ({ methodValue }) => {
  const method = BADGE_METHOD_OPTIONS.find(
    (option) => option.value === methodValue
  );

  if (!method) {
    return null;
  }

  let variant = "default";
  switch (method.value) {
    case 0:
      variant = "outline";
      break;
    case 1:
      variant = "secondary";
      break;
    case 2:
      variant = "ghost";
      break;
    default:
      variant = "destructive";
      break;
  }

  return (
    <>
      /<Badge variant={variant}>{method.label}</Badge>;
    </>
  );
};

export default MethodBadge;

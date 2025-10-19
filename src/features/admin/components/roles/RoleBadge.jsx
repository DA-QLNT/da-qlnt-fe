import { Badge } from "@/components/ui/badge";
import React from "react";

const RoleBadge = ({ roleName }) => {
  if (!roleName) {
    return <Badge variant={"outline"}>N/A</Badge>;
  }
  let variant = "default";
  if (roleName === "ADMIN") {
    variant = "destructive";
  } else if (roleName === "OWNER") {
    variant = "secondary";
  } else if (roleName === "USER" || roleName === "TENANT") {
    variant = "default";
  }
  return (
    <Badge variant={variant} className="uppercase">
      {roleName}
    </Badge>
  );
};

export default RoleBadge;

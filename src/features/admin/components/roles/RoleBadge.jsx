import { Badge } from "@/components/ui/badge";
import React from "react";

const RoleBadge = ({ roleName }) => {
  if (!roleName) {
    return <Badge variant={"ghost"}>N/A</Badge>;
  }
  let variant = "secondary";
  if (roleName === "ADMIN") {
    variant = "destructive";
  } else if (roleName === "OWNER") {
    variant = "default";
  } else if (roleName === "USER") {
    variant = "outline";
  }
  return (
    <Badge variant={variant} className="uppercase">
      {roleName}
    </Badge>
  );
};

export default RoleBadge;

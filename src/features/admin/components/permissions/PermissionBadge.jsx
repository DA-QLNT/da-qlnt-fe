import { Badge } from "@/components/ui/badge";
import React from "react";

const PermissionBadge = ({ permissionName }) => {
  if (!permissionName) {
    return <Badge variant={"ghost"}>N/A</Badge>;
  }
  let variant = "outline";
  if (permissionName === "ALL") {
    variant = "destructive";
  }
  return (
    <Badge variant={variant} className="capitalize">
      {permissionName}
    </Badge>
  );
};

export default PermissionBadge;

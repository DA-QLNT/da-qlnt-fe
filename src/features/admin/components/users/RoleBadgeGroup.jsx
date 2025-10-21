import { Badge } from "@/components/ui/badge";
import React from "react";

const RoleBadgeGroup = ({ roles }) => {
  if (!roles || roles.length === 0) {
    return <Badge variant={"ghost"}>N/A</Badge>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {roles.map((role) => {
        let variant = "secondary";

        if (role === "ADMIN") {
          variant = "destructive";
        } else if (role === "OWNER") {
          variant = "default";
        } else if (role === "USER" || role === "TENANT") {
          variant = "outline";
        }

        return (
          <Badge key={role} variant={variant} className="uppercase">
            {role}
          </Badge>
        );
      })}
    </div>
  );
};

export default RoleBadgeGroup;

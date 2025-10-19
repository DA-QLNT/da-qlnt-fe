import { Badge } from "@/components/ui/badge";
import React from "react";

const RoleBadgeGroup = ({ roles }) => {
  if (!roles || roles.length === 0) {
    return <Badge variant={"outline"}>N/A</Badge>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {roles.map((role) => {
        let variant = "default";

        if (role === "ADMIN") {
          variant = "destructive";
        } else if (role === "OWNER") {
          variant = "secondary";
        } else if (role === "USER" || role === "TENANT") {
          variant = "default";
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

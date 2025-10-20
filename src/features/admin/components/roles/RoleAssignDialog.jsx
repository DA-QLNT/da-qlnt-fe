import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

import {
  useAssignRoleMutation,
  useGetRolesQuery,
  useRemoveRoleMutation,
} from "../../store/roleApi";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const RoleAssignDialog = ({ selectedUser, open, onOpenChange }) => {
  const { t } = useTranslation("rolecontent");
  const { id: userId, username, roles: currentRoles } = selectedUser || {};

  // get available role
  const { data: roleData, isLoading: isLoadingRoles } = useGetRolesQuery({
    page: 0,
    size: 100,
  });
  const allRoles = roleData?.roles || [];

  // mutation
  const [assignRole, { isLoading: isAssigning }] = useAssignRoleMutation();
  const [removeRole, { isLoading: isRemoving }] = useRemoveRoleMutation();

  const isMutating = isAssigning || isRemoving;

  // state for checked/unchecked roles in dialog
  const [assignedRoleIds, setAssignedRoleIds] = useState(new Set());

  // dong bo trang thai checkbox khi dialog mo hoac user thay doi
  useEffect(() => {
    if (currentRoles) {
      // chuyen mang ten role hien tai thanh set chua id role tuong ung
      const currentRoleNames = new Set(currentRoles);
      const initialIds = new Set(
        allRoles
          .filter((role) => currentRoleNames.has(role.name))
          .map((role) => role.id)
      );
      setAssignedRoleIds(initialIds);
    }
  }, [currentRoles, allRoles, open]);

  // handle khi checkbox change
  const handleRoleChange = (roleId, isChecked) => {
    setAssignedRoleIds((prev) => {
      const newSet = new Set(prev);
      if (isChecked) {
        newSet.add(roleId);
      } else {
        newSet.delete(roleId);
      }
      return newSet;
    });
  };
  // submit
  const handleConfirm = async () => {
    if (!userId) return;
    const currentRoleIds = new Set(
      allRoles
        .filter((role) => new Set(currentRoles).has(role.name))
        .map((role) => role.id)
    );
    const rolesToAdd = Array.from(assignedRoleIds).filter(
      (id) => !currentRoleIds.has(id)
    );
    const rolesToRemove = Array.from(currentRoleIds).filter(
      (id) => !assignedRoleIds.has(id)
    );
    const promises = [];

    // create promise for action
    rolesToAdd.forEach((roleId) =>
      promises.push(assignRole({ userId, roleId }))
    );
    rolesToRemove.forEach((roleId) =>
      promises.push(removeRole({ userId, roleId }))
    );

    if (promises.length === 0) {
      onOpenChange(false);
      return;
    }

    try {
      await Promise.all(promises);
      toast.success(t("AssignRoleSuccess"));
      onOpenChange(false);
    } catch (error) {
      toast.error("Assign roles failed");
      console.error("Role update", error);
    }
  };

  const dialogContentClasses = cn(
    "w-full",
    "sm:max-w-xl",
    "md:max-w-2xl",
    "lg:max-w-3xl",
    "xl:max-w-4xl"
  );
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={dialogContentClasses}>
        <DialogHeader>
          <DialogTitle>
            {t("AssignRoleToUser")} {username}
          </DialogTitle>
        </DialogHeader>
        {isLoadingRoles ? (
          <Spinner />
        ) : (
          <div className="grid gap-4 py-4">
            <h3>{t("ChooseRole")}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2">
              {allRoles.map((role) => (
                <div key={role.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`role-${role.id}`}
                    checked={assignedRoleIds.has(role.id)}
                    onCheckedChange={(checked) =>
                      handleRoleChange(role.id, checked)
                    }
                    disabled={isMutating}
                  />
                  <Label
                    htmlFor={`role-${role.id}`}
                    className={"text-sm font-medium"}
                  >
                    {role.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}
        <DialogFooter>
          <Button
            variant={"outline"}
            onClick={() => onOpenChange(false)}
            disabled={isMutating}
          >
            {t("Cancel")}
          </Button>
          <Button onClick={handleConfirm} disabled={isMutating}>
            {isMutating ? <Spinner /> : t("Confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RoleAssignDialog;

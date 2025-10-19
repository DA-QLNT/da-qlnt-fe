import React, { useEffect, useState } from "react";
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

const RoleAssignDialog = ({ selectedUser, open, onOpenChange }) => {
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
      toast.success("Assign roles successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error("Assign roles failed");
      console.error("Role update", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={"md:max-w-[450px]"}>
        <DialogHeader>
          <DialogTitle>Assign role to {username}</DialogTitle>
        </DialogHeader>
        {isLoadingRoles ? (
          <Spinner />
        ) : (
          <div className="grid gap-4 py-4">
            <h3>Choose roles to assign</h3>
            <div className="space-y-3">
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
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isMutating}>
            {isMutating ? <Spinner /> : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RoleAssignDialog;

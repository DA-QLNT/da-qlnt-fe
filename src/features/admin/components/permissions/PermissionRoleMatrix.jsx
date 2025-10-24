import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  useAssignPermissionMutation,
  useRemovePermissionMutation,
} from "../../store/permissionApi";
import toast from "react-hot-toast";
import { Spinner } from "@/components/ui/spinner";
import PermissionBadge from "./PermissionBadge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
// thêm hook lấy permissions theo role
import { useGetRolePermissionsQuery } from "../../store/roleApi";
import { Separator } from "@/components/ui/separator";

const ADMIN_ROLE_NAME = "ADMIN";
const ALL_PERMISSION_CODE = "ALL";

/**
 * RolePermissionsFetcher: component con dùng hook RTK Query cố định cho 1 role.
 * Khi data thay đổi, gọi onUpdate để parent lưu vào map.
 */
function RolePermissionsFetcher({ roleId, onUpdate, skip }) {
  const query = useGetRolePermissionsQuery(roleId, {
    skip,
    // refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    // chuyển nguyên object query về parent (data/isFetching/isSuccess/...)
    onUpdate(roleId, query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleId, query.data, query.isFetching, query.isSuccess, query.isError]);

  return null;
}

// Component chính nhận allRoles/allPermissions và mount nhiều RolePermissionsFetcher
const PermissionRoleMatrix = ({
  allRoles,
  allPermissions,
  loadingRoles,
  loadingPermissions,
}) => {
  // ====================== 2. MUTATIONS & STATES ======================
  const [assignPermission] = useAssignPermissionMutation();
  const [removePermission] = useRemovePermissionMutation();
  const [isMutating, setIsMutating] = useState(false);

  const [matrixState, setMatrixState] = useState({});
  const [initialMatrixState, setInitialMatrixState] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // map lưu kết quả query cho từng role: { [roleId]: queryResult }
  const [rolePermissionsMap, setRolePermissionsMap] = useState({});

  const handleRoleQueryUpdate = useCallback((roleId, queryResult) => {
    setRolePermissionsMap((prev) => {
      // tránh cập nhật không cần thiết
      const prevQ = prev[roleId];
      if (prevQ === queryResult) return prev;
      return { ...prev, [roleId]: queryResult };
    });
  }, []);

  // ====================== 3. ASYNC INITIAL STATE  ======================
  useEffect(() => {
    const allQueriesFulfilled = allRoles.every((role) => {
      const q = rolePermissionsMap[role.id];
      // coi là fulfilled khi có data (hoặc đã bị skip)
      return Boolean(q && (q.isSuccess || q.data));
    });

    if (
      !loadingRoles &&
      !loadingPermissions &&
      allRoles.length > 0 &&
      allQueriesFulfilled
    ) {
      const newMatrix = {};

      allRoles.forEach((role) => {
        const queryResult = rolePermissionsMap[role.id];
        const assignedPermissions = queryResult?.data || [];
        const assignedPermissionCodes = new Set(
          assignedPermissions.map((permission) => permission.code)
        );

        newMatrix[role.id] = {};
        allPermissions.forEach((perm) => {
          newMatrix[role.id][perm.id] = assignedPermissionCodes.has(perm.code);
        });
      });

      setMatrixState(newMatrix);
      setInitialMatrixState(newMatrix);
      setHasChanges(false);
    }
    // dependencies: khi rolePermissionsMap thay đổi, effect sẽ chạy
  }, [
    loadingRoles,
    loadingPermissions,
    allRoles,
    allPermissions,
    rolePermissionsMap,
  ]);

  // ====================== 4. LOGIC & HANDLERS ======================
  const sortedPermissions = useMemo(() => {
    return [...allPermissions].sort((a, b) => a.code.localeCompare(b.code));
  }, [allPermissions]);

  const handleMatrixChange = (roleId, permissionId, isChecked) => {
    setMatrixState((prev) => {
      const newState = JSON.parse(JSON.stringify(prev));
      newState[roleId][permissionId] = isChecked;

      const isAllPermissionRow =
        allPermissions.find((p) => p.id === permissionId)?.code ===
        ALL_PERMISSION_CODE;
      if (isAllPermissionRow) {
        allPermissions.forEach((p) => {
          newState[roleId][p.id] = isChecked;
        });
      }

      const hasChanged =
        JSON.stringify(newState) !== JSON.stringify(initialMatrixState);
      setHasChanges(hasChanged);
      return newState;
    });
  };

  const handleSave = async () => {
    if (!hasChanges) return;
    setIsMutating(true);

    const promises = [];
    allRoles.forEach((role) => {
      sortedPermissions.forEach((perm) => {
        const currentChecked = matrixState[role.id]?.[perm.id];
        const initialChecked = initialMatrixState[role.id]?.[perm.id];

        if (currentChecked !== initialChecked) {
          if (currentChecked) {
            promises.push(
              assignPermission({ roleId: role.id, permissionId: perm.id })
            );
          } else {
            promises.push(
              removePermission({ roleId: role.id, permissionId: perm.id })
            );
          }
        }
      });
    });

    try {
      await Promise.all(promises);
      toast.success("UpdateSuccess");
      setInitialMatrixState(matrixState);
      setHasChanges(false);
    } catch (error) {
      toast.error("UpdateFailed");
      console.error(error);
    } finally {
      setIsMutating(false);
    }
  };

  const handleCancel = () => {
    setMatrixState(initialMatrixState);
    setHasChanges(false);
  };

  const totalLoading =
    loadingRoles ||
    loadingPermissions ||
    Object.values(rolePermissionsMap).some((q) => q?.isFetching) ||
    !Object.keys(matrixState).length;

  // ====================== 5. UI RENDER ======================
  return (
    <div className="flex flex-col w-full gap-4">
      {/* Mount các fetcher con — mỗi fetcher gọi 1 hook cố định */}
      {allRoles.map((role) => (
        <RolePermissionsFetcher
          key={role.id}
          roleId={role.id}
          skip={!role.id}
          onUpdate={handleRoleQueryUpdate}
        />
      ))}

      <div className="flex items-center  justify-end">
        <ButtonGroup>
          <Button
            onClick={handleSave}
            disabled={isMutating || !hasChanges}
            title={hasChanges ? "Save Changes" : "No Changes"}
          >
            {isMutating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Save"
            )}
          </Button>
          <Button
            onClick={handleCancel}
            disabled={isMutating}
            title="Cancel"
            variant={"secondary"}
          >
            Cancel
          </Button>
        </ButtonGroup>
      </div>
      <div className="relative w-full overflow-x-scroll border rounded-lg shadow-xl shadow-secondary">
        {totalLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 dark:bg-black/70">
            <Spinner className={"size-10"} />
          </div>
        )}
        <Table className={"min-w-max "}>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 bg-secondary z-20 min-w-[150px]">
                Permission
              </TableHead>
              {/* <Separator orientation="vertical" /> */}

              {allRoles.map((role) => (
                <TableHead
                  key={role.id}
                  className={"text-center min-w-[120px]"}
                >
                  {role.name}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedPermissions.map((perm) => {
              const isAllPermission = perm.code === ALL_PERMISSION_CODE;
              return (
                <TableRow key={perm.id}>
                  <TableCell
                    className={
                      "sticky left-0 bg-secondary z-20 font-medium whitespace-nowrap "
                    }
                  >
                    <PermissionBadge permissionName={perm.code} />
                  </TableCell>
                  {/* <Separator orientation="vertical" /> */}
                  {allRoles.map((role) => {
                    const isChecked = matrixState[role.id]?.[perm.id] || false;
                    const isDisabled =
                      (role.name !== ADMIN_ROLE_NAME && isAllPermission) ||
                      isMutating ||
                      totalLoading;

                    const effectiveChecked =
                      isAllPermission && role.name !== ADMIN_ROLE_NAME
                        ? false
                        : isChecked;

                    return (
                      <TableCell key={role.id} className={"text-center"}>
                        <Checkbox
                          checked={effectiveChecked}
                          disabled={isDisabled}
                          onCheckedChange={(checked) =>
                            handleMatrixChange(role.id, perm.id, checked)
                          }
                          className={
                            isAllPermission
                              ? "data-[state=checked]:bg-red-500"
                              : ""
                          }
                        />
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
            {sortedPermissions.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={allRoles.length + 1}
                  className="text-center"
                >
                  Không có Permission nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PermissionRoleMatrix;

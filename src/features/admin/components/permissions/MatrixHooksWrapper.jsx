import React from "react";
import { useGetRolesQuery } from "../../store/roleApi";
import { useGetPermissionsQuery } from "../../store/permissionApi";
import PermissionRoleMatrix from "./PermissionRoleMatrix";

/**
 * Component này gọi các Hooks base (Roles, Permissions) ở top-level.
 * Các hook theo role được thực hiện trong component con để tránh
 * thay đổi thứ tự/số lượng hooks trong MatrixHooksWrapper.
 */
const MatrixHooksWrapper = () => {
  // Fetch base data
  const { data: roleData, isLoading: loadingRoles } = useGetRolesQuery({
    page: 0,
    size: 20,
  });
  const allRoles = roleData?.roles || [];

  const { data: permissionData, isLoading: loadingPermissions } =
    useGetPermissionsQuery({ page: 0, size: 1000 });
  const allPermissions = permissionData?.permissions || [];

  return (
    <PermissionRoleMatrix
      allRoles={allRoles}
      allPermissions={allPermissions}
      loadingRoles={loadingRoles}
      loadingPermissions={loadingPermissions}
    />
  );
};

export default MatrixHooksWrapper;

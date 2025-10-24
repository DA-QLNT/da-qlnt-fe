import { baseApi } from "@/store/api/baseApi";

export const permissionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPermissions: builder.query({
      query: (params) => ({
        url: "/permissions/getAll",
        method: "GET",
        params: params,
      }),
      transformResponse: (response) => {
        return {
          permissions: response.result.content,
          totalElements: response.result.totalElements,
          totalPages: response.result.totalPages,
        };
      },
      providesTags: ["Permission"],
    }),
    deletePermission: builder.mutation({
      query: (permissionId) => ({
        url: `/permissions/${permissionId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Permission"],
    }),
    assignPermission: builder.mutation({
      query: ({ roleId, permissionId }) => ({
        url: `/permissions/assign?roleId=${roleId}&permissionId=${permissionId}`,
        method: "POST",
      }),
      // Invalidates cache của Permission Matrix cho role đó
      invalidatesTags: (result, error, { roleId }) => [
        { type: "RolePermissions", id: roleId },
      ],
    }),
    removePermission: builder.mutation({
      query: ({ roleId, permissionId }) => ({
        url: `/permissions/remove?roleId=${roleId}&permissionId=${permissionId}`,
        method: "POST",
      }),
      // Invalidates cache của Permission Matrix cho role đó
      invalidatesTags: (result, error, { roleId }) => [
        { type: "RolePermissions", id: roleId },
      ],
    }),
    createOrUpdatePermission: builder.mutation({
      query: (permissionData) => ({
        url: "/permissions/createOrUpdate",
        method: "POST",
        data: permissionData,
      }),
      invalidatesTags: ["Permission"],
    }),
  }),
});
export const {
  useGetPermissionsQuery,
  useDeletePermissionMutation,
  useAssignPermissionMutation,
  useRemovePermissionMutation,
  useCreateOrUpdatePermissionMutation,
} = permissionApi;

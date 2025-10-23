import { baseApi } from "@/store/api/baseApi";

export const roleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRoles: builder.query({
      query: (params) => ({
        url: "/roles/getAll",
        method: "GET",
        params: params,
      }),
      transformResponse: (response) => {
        return {
          roles: response.result.content,
          totalElements: response.result.totalElements,
          totalPages: response.result.totalPages,
        };
      },
      providesTags: ["Role"],
    }),
    createRole: builder.mutation({
      query: (roleData) => ({
        url: "/roles/create",
        method: "POST",
        data: roleData,
      }),
      invalidatesTags: ["Role"],
    }),
    assignRole: builder.mutation({
      query: ({ userId, roleId }) => ({
        url: `/roles/assign?userId=${userId}&roleId=${roleId}`,
        method: "POST",
      }),
      invalidatesTags: ["Role", "User"],
    }),
    removeRole: builder.mutation({
      query: ({ userId, roleId }) => ({
        url: `/roles/remove?userId=${userId}&roleId=${roleId}`,
        method: "POST",
      }),
      invalidatesTags: ["Role", "User"],
    }),
    deleteRole: builder.mutation({
      query: (roleId) => ({
        url: `/roles/${roleId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Role"],
    }),

    // role-permission
    getRolePermissions: builder.query({
      query: (roleId) => ({
        url: `/roles/role-permissions/${roleId}`,
        method: "GET",
      }),
      transformResponse: (response) => response.result,
      providesTags: (result, error, id) => [{ type: "RolePermission", id }],
    }),
  }),
});
export const {
  useGetRolesQuery,
  useCreateRoleMutation,
  useAssignRoleMutation,
  useRemoveRoleMutation,
  useDeleteRoleMutation,
  useGetRolePermissionsQuery,
} = roleApi;

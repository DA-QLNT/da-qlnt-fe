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
      query:(permissionId)=>({
        url:`/permissions/${permissionId}`,
        method:'DELETE',
      })
      ,
      invalidatesTags: ["Permission"],
    })
  }),
});
export const { useGetPermissionsQuery, useDeletePermissionMutation } = permissionApi;
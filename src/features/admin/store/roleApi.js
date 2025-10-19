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
  }),
});
export const { useGetRolesQuery, useCreateRoleMutation } = roleApi;
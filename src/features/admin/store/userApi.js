import { baseApi } from "@/store/api/baseApi";
export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: (params) => ({
        url: "/users/getAll",
        method: "GET",
        params: params, //search/pagination
      }),
      transformResponse: (response) => {
        return {
          users: response.result.content,
          totalElements: response.result.totalElements,
          totalPages: response.result.totalPages,
        };
      },
      providesTags: ["User"],
    }),
  }),
});
export const { useGetUsersQuery } = userApi;

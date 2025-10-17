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
    deleteUser:builder.mutation({
      query:(userId)=>({
        url:`/users/${userId}`,
        method:'DELETE',
      }),
      invalidatesTags:['User']// sau khi xoa thanh cong thi vo hieu hoa cache de lam moi bang
    })
  }),
});
export const { useGetUsersQuery, useDeleteUserMutation } = userApi;

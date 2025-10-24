import { baseApi } from "@/store/api/baseApi";

export const houseApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getHousesByOwnerId: builder.query({
      query: ({ ownerId, page = 0, size = 10 }) => ({
        url: `/houses/owner/${ownerId}`,
        method: "GET",
        params: {
          page,
          size,
        },
      }),
      transformResponse: (response) => {
        return {
          houses: response.result.content,
          totalElements: response.result.totalElements,
          totalPages: response.result.totalPages,
        };
      },
      providesTags: ["House"],
    }),
  }),
});

export const { useGetHousesByOwnerIdQuery } = houseApi;

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
    getRules: builder.query({
      query: (params) => ({
        url: "/rules",
        method: "GET",
        params: params,
      }),
      transformResponse: (response) => {
        return {
          rules: response.result.content,
          totalElements: response.result.totalElements,
          totalPages: response.result.totalPages,
        };
      },
      providesTags: ["Rule"],
    }),
    createRule: builder.mutation({
      query: (ruleData) => ({
        url: "/rules",
        method: "POST",
        data: ruleData,
      }),
      invalidatesTags: ["Rule"],
    }),
  }),
});

export const { useGetHousesByOwnerIdQuery, useGetRulesQuery, useCreateRuleMutation } = houseApi;

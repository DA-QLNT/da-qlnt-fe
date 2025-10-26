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
    getHouseById: builder.query({
      query: (houseId) => ({
        url: `/houses/${houseId}`,
        method: "GET",
      }),
      transformResponse: (response) => response.result,
      providesTags: (result, error, id) => [{ type: "House", id }],
    }),
    createHouse: builder.mutation({
      query: (houseData) => ({
        url: "/houses",
        method: "POST",
        data: houseData,
      }),
      invalidatesTags: ["House"],
    }),
    updateHouse: builder.mutation({
      query: ({ houseId, ...houseData }) => ({
        url: `/houses/${houseId}`,
        method: "PUT",
        data: houseData,
      }),
      invalidatesTags: (results, error, { houseId }) => [
        "House",
        { type: "House", id: houseId },
      ],
    }),
    deleteHouse: builder.mutation({
      query: (houseId) => ({
        url: `/houses/${houseId}`,
        method: "DELETE",
      }),
      invalidatesTags: (results, error, houseId) => [
        "House",
        { type: "House", id: houseId },
      ],
    }),
    // rules=====================
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

export const {
  useGetHousesByOwnerIdQuery,
  useCreateHouseMutation,
  useGetRulesQuery,
  useCreateRuleMutation,
  useGetHouseByIdQuery,
  useDeleteHouseMutation,
  useUpdateHouseMutation,
} = houseApi;

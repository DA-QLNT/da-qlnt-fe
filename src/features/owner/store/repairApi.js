import { baseApi } from "@/store/api/baseApi";

export const repairOwnerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 🚨 QUERY LẤY DANH SÁCH YÊU CẦU SỬA CHỮA THEO NHÀ
    getHouseRepairRequests: builder.query({
      query: ({ houseId, page = 0, size = 20 }) => ({
        url: `/repairs/house/${houseId}`,
        method: "GET",
        params: {
          page,
          size,
        },
      }),
      transformResponse: (response) => response.result,
      providesTags: (result, error, { houseId }) => [
        "Repair",
        { type: "RepairHouse", id: houseId },
      ],
    }),
    // 🚨 MUTATION HOÀN THÀNH YÊU CẦU
    completeRepairRequest: builder.mutation({
      query: ({ repairId, data }) => ({
        url: `/repairs/${repairId}/status`,
        method: "PUT",
        // Body phải bao gồm status=2, note, cost
        data: {
          ...data,
          status: 2, // Hardcode status là 2 (Hoàn thành)
        },
      }),
      invalidatesTags: (result, error, { repairId }) => [
        "Repair",
        { type: "RepairHouse", id: result?.houseId },
      ],
    }),
  }),
});

export const {
  useGetHouseRepairRequestsQuery,
  useCompleteRepairRequestMutation,
} = repairOwnerApi;

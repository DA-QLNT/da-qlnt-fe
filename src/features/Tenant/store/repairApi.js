import { baseApi } from "@/store/api/baseApi";

export const repairApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 🚨 QUERY LẤY DANH SÁCH YÊU CẦU SỬA CHỮA CỦA CHÍNH TENANT
    getTenantRepairRequests: builder.query({
      query: ({ page = 0, size = 20 }) => ({
        url: `/repairs/tenant`,
        method: "GET",
        params: { page, size },
      }),
      // API trả về phân trang, ta transform để lấy content
      transformResponse: (response) => response.result,
      providesTags: ["Repair"],
    }),

    // 🚨 MUTATION TẠO YÊU CẦU (POST)
    createRepairRequest: builder.mutation({
      query: (formData) => ({
        url: `/repairs`,
        method: "POST",
        data: formData, // Dạng FormData
      }),
      invalidatesTags: ["Repair"],
    }),

    // 🚨 MUTATION SỬA YÊU CẦU (PUT)
    updateRepairRequest: builder.mutation({
      query: ({ repairId, formData }) => ({
        url: `/repairs/${repairId}`,
        method: "PUT",
        data: formData, // Dạng FormData
      }),
      invalidatesTags: (result, error, { repairId }) => [
        "Repair",
        { type: "Repair", id: repairId },
      ],
    }),
  }),
});

export const {
  useGetTenantRepairRequestsQuery,
  useCreateRepairRequestMutation,
  useUpdateRepairRequestMutation,
} = repairApi;

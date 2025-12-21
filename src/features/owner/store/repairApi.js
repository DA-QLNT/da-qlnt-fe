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

    // 🚨 MUTATION CẬP NHẬT TRẠNG THÁI (Mới)
    updateRepairStatus: builder.mutation({
      query: ({ repairId, status, ...data }) => {
        const formData = new FormData();
        formData.append("status", status);
        // Append other data fields if they exist
        Object.keys(data).forEach((key) => {
          const value = data[key];
          if (value !== undefined && value !== null) {
            if (value instanceof FileList) {
              Array.from(value).forEach((file) => {
                formData.append(key, file);
              });
            } else if (Array.isArray(value)) {
              value.forEach((item) => {
                formData.append(key, item);
              });
            } else {
              formData.append(key, value);
            }
          }
        });
        return {
          url: `/repairs/${repairId}/status`,
          method: "PUT",
          data: formData,
        };
      },
      invalidatesTags: (result, error, { repairId }) => [
        "Repair",
        { type: "RepairHouse", id: result?.houseId },
      ],
    }),
    // 🚨 QUERY LẤY TẤT CẢ YÊU CẦU SỬA CHỮA CÓ BỘ LỌC
    getAllRepairRequests: builder.query({
      query: ({ status, houseId, keyword, page = 0, size = 20 }) => ({
        url: `/repairs`,
        method: "GET",
        params: {
          status: status === "all" ? undefined : status,
          houseId: houseId === "all" ? undefined : houseId,
          keyword: keyword || undefined,
          page,
          size,
        },
      }),
      transformResponse: (response) => response.result,
      providesTags: ["Repair"],
    }),
  }),
});

export const {
  useGetHouseRepairRequestsQuery,
  useUpdateRepairStatusMutation,
  useGetAllRepairRequestsQuery,
} = repairOwnerApi;

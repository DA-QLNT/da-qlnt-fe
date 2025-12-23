import { baseApi } from "@/store/api/baseApi";

export const adminReportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 🚨 QUERY LẤY THỐNG KÊ TỔNG QUAN CHO ADMIN
    getAdminDashboardStats: builder.query({
      query: () => ({
        url: "/admin/dashboard",
        method: "GET",
      }),
      transformResponse: (response) => response.result,
      // Có thể để thời gian cache ngắn vì dashboard cần số liệu mới
      providesTags: ["AdminStats"],
    }),
  }),
});

export const { useGetAdminDashboardStatsQuery } = adminReportApi;

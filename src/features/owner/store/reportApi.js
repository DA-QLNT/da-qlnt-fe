import { baseApi } from "@/store/api/baseApi";

export const reportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 🚨 MUTATION LẤY BÁO CÁO DOANH THU (POST request)
    getRevenueReport: builder.mutation({
      query: (reportFilters) => ({
        url: `/reports/revenue`,
        method: "POST",
        data: reportFilters, // { houseIds, fromDate, toDate }
      }),
      transformResponse: (response) => response.result,
      // Không cần providesTags vì đây là báo cáo tạm thời
    }),
  }),
});

export const { useGetRevenueReportMutation } = reportApi;

import { baseApi } from "@/store/api/baseApi";

export const reportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    //  MUTATION LẤY BÁO CÁO DOANH THU (POST request)
    getRevenueReport: builder.mutation({
      query: (reportFilters) => ({
        url: `/reports/revenue`,
        method: "POST",
        data: reportFilters, // { houseIds, fromDate, toDate }
      }),
      transformResponse: (response) => response.result,
      // Không cần providesTags vì đây là báo cáo tạm thời
    }),
    getRoomReport: builder.mutation({
      query: (reportFilters) => ({
        url: `/reports/room`, // Endpoint: /reports/room
        method: "POST",
        data: reportFilters, // { houseIds }
      }),
      transformResponse: (response) => response.result,
    }),
    // 🚨 MUTATION LẤY BÁO CÁO HÓA ĐƠN (POST request)
    getInvoiceReport: builder.mutation({
      query: ({ filters, page = 0, size = 10 }) => ({
        url: `/reports/invoice?page=${page}&size=${size}`,
        method: "POST",
        data: filters, // { houseIds, fromDate, toDate, status, month, year, paymentMethod }
      }),
      transformResponse: (response) => response.result,
    }),
    // 🚨 MUTATION XUẤT CHI TIẾT HÓA ĐƠN EXCEL
    exportInvoiceDetail: builder.mutation({
      query: (invoiceId) => ({
        url: `/excel/invoice-detail`,
        method: "POST",
        params: { invoiceId },
        responseHandler: async (response) => response.blob(), // Quan trọng: xử lý dữ liệu nhị phân
        cache: "no-cache",
      }),
    }),
  }),
});

export const {
  useGetRevenueReportMutation,
  useGetRoomReportMutation,
  useGetInvoiceReportMutation,
  useExportInvoiceDetailMutation,
} = reportApi;

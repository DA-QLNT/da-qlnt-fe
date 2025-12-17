import { baseApi } from "@/store/api/baseApi";

export const invoiceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 🚨 QUERY LẤY DANH SÁCH HÓA ĐƠN THEO ID HỢP ĐỒNG
    getInvoicesByContract: builder.query({
      query: (contractId) => ({
        url: `/invoices/by-contract/${contractId}`,
        method: "GET",
      }),
      transformResponse: (response) => response.result,
      providesTags: ["Invoice"],
    }),

    // Query lấy chi tiết hóa đơn (dùng cho Dialog)
    getInvoiceDetail: builder.query({
      query: (invoiceId) => ({
        url: `/invoices/${invoiceId}`,
        method: "GET",
      }),
      transformResponse: (response) => response.result,
      providesTags: (result, error, id) => [{ type: "Invoice", id }],
    }),
    // 🚨 MUTATION TẠO URL THANH TOÁN VNPAY
    createVNPayUrl: builder.mutation({
      query: (invoiceId) => ({
        url: `/payment/vnpay/create`,
        method: "POST",
        data: { invoiceId }, // Truyền body đúng format anh yêu cầu
      }),
      transformResponse: (response) => response.result,
    }),
  }),
});

export const {
  useGetInvoicesByContractQuery,
  useGetInvoiceDetailQuery,
  useCreateVNPayUrlMutation,
} = invoiceApi;

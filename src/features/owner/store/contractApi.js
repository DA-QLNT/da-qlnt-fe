import { baseApi } from "@/store/api/baseApi";

export const contractApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createContract: builder.mutation({
      query: (contractData) => ({
        url: "/contracts",
        method: "POST",
        data: contractData,
        headers: {
          "Content-Type": "application/json", // ✅ Explicitly set
        },
      }),
      // Invalidates tags Contract chung và Room Detail (vì status phòng sẽ thay đổi)
      invalidatesTags: (result, error, { roomId }) => [
        "Contract",
        { type: "Room", id: roomId },
      ],
    }),
    getContractById: builder.query({
      query: (contractId) => ({
        url: `/contracts/${contractId}`,
        method: "GET",
      }),
      transformResponse: (response) => response.result,
      providesTags: (result, error, id) => [{ type: "Contract", id }],
    }),
    updateContractInfor: builder.mutation({
      query: ({ contractId, ...contractData }) => ({
        url: `/contracts/${contractId}`,
        method: "PUT",
        data: contractData,
      }),
      invalidatesTags: (results, error, { contractId }) => [
        { type: "Contract", id: contractId },
      ],
    }),
  }),
});

export const {
  useCreateContractMutation,
  useGetContractByIdQuery,
  useUpdateContractInforMutation,
} = contractApi;

import { baseApi } from "@/store/api/baseApi";

export const contractApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createContract: builder.mutation({
      query: (contractData) => ({
        url: "/contracts",
        method: "POST",
        body: contractData,
      }),
      // Invalidates tags Contract chung và Room Detail (vì status phòng sẽ thay đổi)
      invalidatesTags: (result, error, { roomId }) => [
        "Contract",
        { type: "Room", id: roomId },
      ],
    }),
  }),
});

export const { useCreateContractMutation } = contractApi;

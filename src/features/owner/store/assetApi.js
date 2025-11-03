import { baseApi } from "@/store/api/baseApi";

export const assetApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAssets: builder.query({
      query: (params) => ({
        url: "/assets",
        method: "GET",
        params: params,
      }),
      transformResponse: (response) => response.result,
      providesTags: ["Asset"],
    }),
    getAssetById: builder.query({
      query: (assetId) => ({
        url: `/assets/${assetId}`,
        method: "GET",
      }),
      transformResponse: (response) => response.result,
      providesTags: (result, error, id) => [{ type: "AssetDetail", id }],
    }),
    createOrUpdateAsset: builder.mutation({
      query: (assetData) => {
        if (assetData.id) {
          const { id, ...data } = assetData;
          return {
            url: `/assets/${id}`,
            method: "PUT",
            data: data,
          };
        }
        return {
          url: "/assets",
          method: "POST",
          data: assetData,
        };
      },
      invalidatesTags: ["Asset"],
    }),
    deleteAsset: builder.mutation({
      query: (assetId) => ({
        url: `/assets/${assetId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Asset"],
    }),
  }),
});

export const { useGetAssetsQuery, useGetAssetByIdQuery, useDeleteAssetMutation, useCreateOrUpdateAssetMutation} = assetApi;

import { baseApi } from "@/store/api/baseApi";

export const serviceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getServices: builder.query({
      query: (params) => ({
        url: "/services/getAll",
        method: "GET",
        params: params,
      }),
      transformResponse: (response) => response.result,
      providesTags: ["Service"],
    }),
    createOrUpdateService: builder.mutation({
      query: (serviceData) => {
        if (serviceData.id) {
          return {
            url: `/services/update`,
            method: "PUT",
            data: serviceData,
          };
        }
        return {
          url: "/services/create",
          method: "POST",
          data: serviceData,
        };
      },
      invalidatesTags: ["Service"],
    }),
    deleteService: builder.mutation({
      query: (serviceId) => ({
        url: `/services/${serviceId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Service"],
    }),
  }),
});
export const { useGetServicesQuery, useCreateOrUpdateServiceMutation, useDeleteServiceMutation } =
  serviceApi;

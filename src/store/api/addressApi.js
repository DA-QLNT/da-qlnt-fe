import { createApi } from "@reduxjs/toolkit/query/react";

import axios from "axios";
import { format } from "date-fns";
const ADDRESS_BASE_URL = "/address-api/";

const publicBaseQuery =
  ({ baseUrl }) =>
  async ({ url, method, params }) => {
    try {
      const result = await axios({
        url: baseUrl + url,
        method,
        params,
      });
      return { data: result.data };
    } catch (axiosError) {
      return {
        error: {
          status: axiosError.response?.status,
          data: axiosError.response?.data || axiosError.message,
        },
      };
    }
  };
// const getCurrentDate = () => format(new Date(), "yyyy-MM-dd");
const EFFECTIVE_DATE = "latest";

export const addressApi = createApi({
  reducerPath: "addressApi",
  baseQuery: publicBaseQuery({ baseUrl: ADDRESS_BASE_URL }),
  endpoints: (builder) => ({
    getProvinces: builder.query({
      query: () => {
        // const date = getCurrentDate();
        return { url: `${EFFECTIVE_DATE}/provinces` };
      },
      transformResponse: (response) => response.provinces,
    }),
    getDistrictsByProvinceCode: builder.query({
      query: (provinceCode) => {
        // const date = getCurrentDate();
        return { url: `${EFFECTIVE_DATE}/provinces/${provinceCode}/communes` };
      },
      transformResponse: (response) => {
        return response.communes;
      },
      providesTags: (result, error, provinceCode) => [
        { type: "Districts", id: provinceCode },
      ],
    }),
  }),
});
export const { useGetProvincesQuery, useGetDistrictsByProvinceCodeQuery } =
  addressApi;

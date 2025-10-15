import { createApi } from "@reduxjs/toolkit/query/react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_API; 

// Base Axios instance

const axiosBaseQuery =
  ({ baseUrl } = { baseUrl: "" }) =>
  async ({ url, method, data, params, headers }) => {
    try {
      const result = await axios({
        url: baseUrl + url,
        method,
        data,
        params,
        headers,
      });
      return { data: result.data };
    } catch (axiosError) {
      let err = axiosError;
      return {
        error: {
          status: err.reponse?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };
  //create baseApi
  export const baseApi = createApi({
    reducerPath:'baseApi',
    baseQuery:axiosBaseQuery({
        baseUrl:BASE_URL,
    }),
    tagTypes:['User', 'Room', 'Contract'],// define tag chung
    endpoints:()=>({})// endpoint sẽ được tiêm vào từ feature
  })

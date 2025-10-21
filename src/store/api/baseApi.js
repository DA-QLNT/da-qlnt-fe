import { createApi } from "@reduxjs/toolkit/query/react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_API;

// Base Axios instance

const axiosBaseQuery =
  ({ baseUrl } = { baseUrl: "" }) =>
  async ({ url, method, data, params, headers }, { getState }) => {
    const token = getState().auth.token;
    const defaultHeaders = {};
    if (token) {
      defaultHeaders["Authorization"] = `Bearer ${token}`;
    }

    const finalHeaders = { ...defaultHeaders, ...headers };
    // 🚨 Nếu dữ liệu KHÔNG phải là FormData, ta MỚI thêm Content-Type: application/json
    if (!(data instanceof FormData)) {
      finalHeaders["Content-Type"] =
        finalHeaders["Content-Type"] || "application/json";
    }
    // Nếu là FormData, Axios sẽ tự lo Content-Type: multipart/form-data với boundary.

    try {
      const result = await axios({
        url: baseUrl + url,
        method,
        data,
        params,
        headers: finalHeaders,
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
  reducerPath: "baseApi",
  baseQuery: axiosBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["User", "Role", "Room", "Contract"], // define tag chung
  endpoints: () => ({}), // endpoint sẽ được tiêm vào từ feature
});

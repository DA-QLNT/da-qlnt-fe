import { logout, setCredentials } from "@/features/auth";
import { createApi } from "@reduxjs/toolkit/query/react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_API;

// refreshToken
const refreshAxios = axios.create({ baseURL: BASE_URL });
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};
// Base Axios instance
const axiosBaseQuery =
  ({ baseUrl } = { baseUrl: "" }) =>
  async ({ url, method, data, params, headers }, { getState, dispatch }) => {
    const token = getState().auth.token;
    const defaultHeaders = {};
    if (token) {
      defaultHeaders["Authorization"] = `Bearer ${token}`;
    }

    const finalHeaders = { ...defaultHeaders, ...headers };
    // // 🚨 Nếu dữ liệu KHÔNG phải là FormData, ta MỚI thêm Content-Type: application/json
    // if (!(data instanceof FormData)) {
    //   finalHeaders["Content-Type"] =
    //     finalHeaders["Content-Type"] || "application/json";
    // }
    // // Nếu là FormData, Axios sẽ tự lo Content-Type: multipart/form-data với boundary.
    // 🚨 LOGIC CHÍNH XÁC ĐỂ XỬ LÝ FormData
    if (data instanceof FormData) {
      // Axios/Browser tự đặt Content-Type: multipart/form-data với boundary.
      // Nếu ta đặt Content-Type: application/json, nó sẽ thất bại.
      // Cần đảm bảo KHÔNG có Content-Type nào được định nghĩa cho FormData.
      delete finalHeaders["Content-Type"];
    }
    // else {
    //   // Dùng JSON mặc định cho các request khác
    //   finalHeaders["Content-Type"] = "application/json";
    // }
    else if (data && !finalHeaders["Content-Type"]) {
      // ✅ Chỉ set khi chưa có và có data
      finalHeaders["Content-Type"] = "application/json";
    }

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

      // 401 handle
      if ((err.response?.status === 401) & token) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              finalHeaders["Authorization"] = `Bearer ${token}`;
              return axios({
                url: baseUrl + url,
                method,
                data,
                params,
                headers: finalHeaders,
              });
            })
            .catch((err) => {
              return { error: { status: 401, data: "Token Refresh Failed" } };
            });
        }
        isRefreshing = true;
        const originalRequest = {
          url,
          method,
          data,
          params,
          headers: finalHeaders,
        };
        try {
          const refreshResponse = await refreshAxios.post("/auth/refresh", {
            token: token,
          });
          const newToken = refreshResponse.data.result.token;
          dispatch(setCredentials({ token: newToken }));
          isRefreshing = false;
          processQueue(null, newToken);
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
          const retryResult = await axios(originalRequest);
          return { data: retryResult.data };
        } catch (refreshError) {
          isRefreshing = false;
          localStorage.removeItem("token");
          dispatch(logout());
          processQueue(refreshError, null);
          return { error: { status: 401, data: "Session Expired" } };
        }
      }
      return {
        error: {
          status: err.response?.status,
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
  tagTypes: [
    "User",
    "Role",
    "Permission",
    "House",
    "Room",
    "Rule",
    "Asset",
    "Service",
    "ServiceHouse",
    "Contract",
  ], // define tag chung
  endpoints: () => ({}), // endpoint sẽ được tiêm vào từ feature
});

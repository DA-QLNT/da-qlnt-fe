import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "./api/baseApi";
import authReducer from "@/features/auth/store/authSlice";

import { addressApi } from "./api/addressApi";
export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    [addressApi.reducerPath]: addressApi.reducer,
    auth: authReducer,
  },
  // addressAPi là api tôi sử dụng bên thư 3
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware, addressApi.middleware),
});

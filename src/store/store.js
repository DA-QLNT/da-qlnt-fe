import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "./api/baseApi";
import authReducer from "@/features/auth/store/authSlice";
import { userApi } from "@/features/admin/store/userApi";
import { roleApi } from "@/features/admin/store/roleApi";
import { addressApi } from "./api/addressApi";
export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    [addressApi.reducerPath]: addressApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware, addressApi.middleware,),
});

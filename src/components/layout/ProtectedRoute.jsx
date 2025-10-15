import { useAuth } from "@/features/auth";
import React from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  if (!isAuthenticated) {
    toast.error(t("auth:RequireLogin"));
    return <Navigate to="/auth/login" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;

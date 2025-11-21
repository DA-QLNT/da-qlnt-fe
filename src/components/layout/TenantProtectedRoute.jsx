import { useAuth } from "@/features/auth";
import React from "react";
import toast from "react-hot-toast";
import { Navigate, Outlet } from "react-router-dom";
import { Spinner } from "../ui/spinner";

const TenantProtectedRoute = () => {
  const { isAuthenticated, isTenant, isLoadingMe } = useAuth();
  if (isAuthenticated && isLoadingMe) {
    return <Spinner className="size-10" />;
  }
  if (!isAuthenticated) {
    toast.error("Require Login");
    return <Navigate to="/auth/login" replace />;
  }
  if (!isTenant) {
    toast.error("Require Tenant Role");
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

export default TenantProtectedRoute;

import { useAuth } from "@/features/auth";
import React from "react";
import toast from "react-hot-toast";
import { Navigate, Outlet } from "react-router-dom";

const OwnerProtectedRoute = () => {
  const { isAuthenticated, isOwner } = useAuth();
  if (!isAuthenticated) {
    toast.error("Require Login");
    return <Navigate to="/auth/login" replace />;
  }
  if (!isOwner) {
    toast.error("Require Owner Role");
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

export default OwnerProtectedRoute;

import { useAuth } from "@/features/auth";
import React from "react";
import toast from "react-hot-toast";
import { Navigate, Outlet } from "react-router-dom";

const AdminProtectedRoute = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    toast.error("Require Login");
    return <Navigate to="/auth/login" replace />;
  }
  if (!isAdmin) {
    toast.error("Require Admin Role");
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

export default AdminProtectedRoute;

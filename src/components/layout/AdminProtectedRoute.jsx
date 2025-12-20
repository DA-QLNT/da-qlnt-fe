import { useAuth } from "@/features/auth";
import React from "react";
import toast from "react-hot-toast";
import { Navigate, Outlet } from "react-router-dom";
import { Spinner } from "../ui/spinner";

const AdminProtectedRoute = () => {
  const { isAuthenticated, isAdmin, isLoadingMe } = useAuth();
  if (isAuthenticated && isLoadingMe) {
    return (
      <div className="absolute flex justify-center items-center inset-0">
        <Spinner className="size-20 text-primary" />
      </div>
    );
  }
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

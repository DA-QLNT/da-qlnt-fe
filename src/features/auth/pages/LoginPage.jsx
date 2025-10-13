import React, { useEffect, useState } from "react";
import LoginForm from "../components/LoginForm";
import RegisterForm from "../components/RegisterForm";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/theme/mode-toggle";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const LoginPage = () => {
  const location = useLocation();
  const navigate = useNavigate()
  const isLogin = location.pathname.includes("login")
  
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 relative">
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(120deg, #d5c5ff 0%, #a7f3d0 50%, #f0f0f0 100%)",
        }}
      />
      <div className="fixed top-2 right-2 flex flex-col md:flex-row gap-4">
        <ModeToggle />

        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-sm relative z-10">
        <Outlet/>
      </div>
    </div>
  );
};

export default LoginPage;

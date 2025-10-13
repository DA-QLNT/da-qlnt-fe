import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "./features/auth";
import { Toaster } from "react-hot-toast";
import HomePage from "./pages/HomePage";
import MainLayout from "./components/layout/MainLayout";
import LoginForm from "./features/auth/components/LoginForm";
import RegisterForm from "./features/auth/components/RegisterForm";
function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="bottom-right" />
      <main className="flex-row">
        <Routes>
          {/* Pages */}
          <Route element={<MainLayout />}>
            <Route path="/" element={HomePage} />
          </Route>

          {/* Auth */}
          <Route path="/auth" element={<LoginPage />}>
            <Route index element={<Navigate to="login" replace />} />
            <Route path="login" element={<LoginForm />} />
            <Route path="register" element={<RegisterForm />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;

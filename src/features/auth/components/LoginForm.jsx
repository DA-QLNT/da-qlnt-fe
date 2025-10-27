import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { selectIsAuthenticated } from "../store/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { useLoginMutation } from "../store/authApi";
import { useForm } from "react-hook-form";
import { LoginSchema } from "@/lib/validation/auth";
import toast from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { Badge } from "lucide-react";
import { baseApi } from "@/store/api/baseApi";

export default function LoginForm({ className, ...props }) {
  const { t, i18n } = useTranslation("login");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // const isAuthenticated = useSelector(selectIsAuthenticated);
  const [login, { isLoading }] = useLoginMutation();

  const { isAuthenticated, isAdmin, isOwner, isUser, isGuest, isLoadingMe } =
    useAuth();

  useEffect(() => {
    // Clear cache của getMe query để tránh dùng data cũ
    dispatch(baseApi.util.resetApiState());
  }, [dispatch]);
  useEffect(() => {
    if (isAuthenticated && !isLoadingMe) {
      if (isAdmin) {
        navigate("/admin", { replace: true });
      } else if (isOwner) {
        navigate("/owner", { replace: true });
      } else if (isUser) {
        navigate("/user", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [isAuthenticated, isAdmin, isOwner, isUser, isLoadingMe, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  const onSubmit = async (data) => {
    try {
      const result = await login(data).unwrap();

      if (result.code === 1000) {
        toast.success(t("LoginSuccess"));
      } else {
        toast.error(result.message || t("LoginFailedGeneric"));
      }
    } catch (error) {
      const errorMessage = error.data?.message || t("LoginFailedNetwork");
      toast.error(errorMessage);
    }
  };
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className={`text-center`}>{t("LoginTitle")}</CardTitle>
          <CardDescription className="text-center">
            {t("LoginDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="username">{t("Username")}</FieldLabel>
                <Input
                  id="username"
                  type="text"
                  placeholder="admin"
                  required
                  {...register("username")}
                />
                {errors.username && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.username.message}
                  </p>
                )}
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">{t("Password")}</FieldLabel>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </Field>
              <Field>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? t("LoggingIn") : t("Login")}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

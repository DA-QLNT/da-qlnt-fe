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

export default function RegisterForm({ className, ...props }) {
  const { t, i18n } = useTranslation("login");
  const navigate = useNavigate()
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className={`text-center`}>{t('SignupTitle')}</CardTitle>
          <CardDescription className={`text-center`}>
            {t('SignupDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="fullname">{t('FullName')}</FieldLabel>
                <Input
                  id="fullname"
                  type="text"
                  placeholder="John Doe"
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">{t('Password')}</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="confirm-password">
                  {t('ConfirmPassword')}
                </FieldLabel>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="********"
                  required
                />
              </Field>

              <Field>
                <Button type="submit" className="w-full">
                  {t('CreateAccount')}
                </Button>
                <Button variant="outline" type="button" className="w-full">
                  {t('SignupWithGoogle')}
                </Button>
                <FieldDescription className="text-center">
                  {t('AlreadyHaveAccount')} <span onClick={()=>navigate('/auth/login')} className="text-primary underline font-bold cursor-pointer">{t('Login')}</span>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

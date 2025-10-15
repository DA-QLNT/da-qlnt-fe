import { z } from "zod";
import { t } from "i18next";
export const LoginSchema = z.object({
  username: z
    .string()
    .min(3, { message: t("validation:MinLengthUsername", { min: 3 }) }),

  password: z
    .string()
    .min(4, { message: t("validation:MinLengthPassword", { min: 4 }) }),
});

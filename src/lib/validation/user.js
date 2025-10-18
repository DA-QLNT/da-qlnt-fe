import { z } from "zod";
export const UserAddSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long"),
  password: z.string().min(4, "Password must be at least 4 characters long"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  address: z.string().min(1, "Address is required"),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 characters long"),
  dob: z.date({
    required_error: "Date of Birth is required."
  }),
});

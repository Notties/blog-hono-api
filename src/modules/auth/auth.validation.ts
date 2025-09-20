import { z } from "zod";

export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  role: z.enum(["admin", "user"]).optional(),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string(),
});

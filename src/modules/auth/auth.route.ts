import { Hono } from "hono";
import { loginSchema, registerSchema } from "./auth.validation";
import { AuthService } from "./auth.service";
import { zValidator } from "@hono/zod-validator";
import { ResponseResult } from "@/shared/utils/response";

const app = new Hono();

app.post("/register", zValidator("json", registerSchema), async (c) => {
  const newUser = await AuthService.registerUser(c.req.valid("json"));
  return ResponseResult(c, newUser, "User registered successfully");
});
app.post("/login", zValidator("json", loginSchema), async (c) => {
  const token = await AuthService.loginUser(c.req.valid("json"));
  return ResponseResult(c, token, "User logged in successfully");
});

export default app;

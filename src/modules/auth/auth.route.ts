import { Hono } from "hono";
import { loginSchema, registerSchema } from "./auth.validation";
import { AuthService } from "./auth.service";
import { zValidator } from "@hono/zod-validator";
import { ResponseResult } from "@/shared/utils/response";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";

const app = new Hono();

app.post("/register", zValidator("json", registerSchema), async (c) => {
  const newUser = await AuthService.registerUser(c.req.valid("json"));
  return ResponseResult(c, newUser, "User registered successfully");
});

app.post("/login", zValidator("json", loginSchema), async (c) => {
  const { accessToken, refreshToken, user } = await AuthService.loginUser(
    c.req.valid("json")
  );

  setCookie(c, "accessToken", accessToken, {
    httpOnly: true,
    secure: true, // Only send cookies over HTTPS
    sameSite: "Strict",
    path: "/",
  });
  setCookie(c, "refreshToken", refreshToken, {
    httpOnly: true,
    secure: true, // Only send cookies over HTTPS
    sameSite: "Strict",
    path: "/api/auth/refresh",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return ResponseResult(c, user, "User logged in successfully");
});

app.post("/refresh", async (c) => {
  const refreshToken = getCookie(c, "refreshToken");
  const { newAccessToken } = await AuthService.refreshAccessToken(
    refreshToken as string
  );

  setCookie(c, "accessToken", newAccessToken, {
    httpOnly: true,
    secure: true, // Only send cookies over HTTPS
    sameSite: "Strict",
    path: "/",
    maxAge: 60 * 15,
  });
  return ResponseResult(c, {}, "Token refreshed successfully");
});

app.post("/logout", async (c) => {
  const refreshToken = getCookie(c, "refreshToken");

  if (refreshToken) {
    await AuthService.logoutUser(refreshToken);
  }

  deleteCookie(c, "accessToken", { path: "/" });
  deleteCookie(c, "refreshToken", { path: "/api/auth/refresh" });

  return ResponseResult(c, {}, "Logged out successfully");
});

export default app;

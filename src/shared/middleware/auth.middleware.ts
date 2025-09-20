import { createMiddleware } from "hono/factory";
import { jwt, verify } from "hono/jwt";
import { db } from "@/db";
import { User, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { config } from "@/config";
import { AppEnv } from "@/shared/types/hono";
import { HTTPException } from "hono/http-exception";
import { getCookie } from "hono/cookie";

export const authMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const token = getCookie(c, "accessToken");

  if (!token) {
    throw new HTTPException(401, {
      message: "Unauthorized: No token provided",
    });
  }

  try {
    const payload = await verify(token, config.jwtSecret);
    if (!payload?.sub) {
      throw new HTTPException(401, {
        message: "Unauthorized: Invalid token payload",
      });
    }

    const userId = parseInt(payload.sub.toString(), 10);
    const [userResult] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!userResult) {
      throw new HTTPException(401, { message: "Unauthorized: User not found" });
    }

    c.set("user", userResult);
    await next();
  } catch (error) {
    throw new HTTPException(401, {
      message: "Unauthorized: Invalid token",
      cause: error,
    });
  }
});

export const roleGuard = (allowedRoles: Array<User["role"]>) => {
  return createMiddleware<AppEnv>(async (c, next) => {
    const user = c.get("user");
    if (!user || !allowedRoles.includes(user.role)) {
      return c.json({ error: "Forbidden: Insufficient permissions" }, 403);
    }
    await next();
  });
};

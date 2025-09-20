import { createMiddleware } from "hono/factory";
import { jwt } from "hono/jwt";
import { db } from "@/db";
import { User, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { config } from "@/config";
import { AppEnv } from "@/shared/types/hono";

export const authMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const jwtMiddleware = jwt({ secret: config.jwtSecret });
  const response = await jwtMiddleware(c, async () => {});
  if (response) return response; // Token is invalid or missing

  const payload = c.get("jwtPayload");
  if (!payload?.sub) {
    return c.json({ error: "Invalid token payload" }, 401);
  }

  const userId = parseInt(payload.sub, 10);
  const [userResult] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!userResult) {
    return c.json({ error: "User not found" }, 401);
  }

  c.set("user", userResult);
  await next();
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

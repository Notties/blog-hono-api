import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sign } from "hono/jwt";
import { config } from "@/config";
import { HTTPException } from "hono/http-exception";
import type { z } from "zod";
import type { registerSchema, loginSchema } from "./auth.validation";
import { randomUUID } from "crypto";
import { redisClient } from "@/shared/utils/redis";

const REFRESH_TOKEN_EXPIRATION_SECONDS = 60 * 60 * 24 * 7; // 7 day

export const AuthService = {
  async registerUser(data: z.infer<typeof registerSchema>) {
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (existingUser) {
      throw new HTTPException(409, { message: "Email already exists" });
    }

    const hashedPassword = await Bun.password.hash(data.password);

    const [newUser] = await db
      .insert(users)
      .values({ ...data, password: hashedPassword })
      .returning({ id: users.id, email: users.email, role: users.role });
    return newUser;
  },

  async loginUser(data: z.infer<typeof loginSchema>) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);
    if (!user) {
      throw new HTTPException(401, { message: "Invalid credentials" });
    }

    const isPasswordValid = await Bun.password.verify(
      data.password,
      user.password
    );
    if (!isPasswordValid) {
      throw new HTTPException(401, { message: "Invalid credentials" });
    }

    const accessTokenPayload = {
      sub: user.id.toString(),
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 60 * 15, // 15 minutes
    };
    const accessToken = await sign(accessTokenPayload, config.jwtSecret);

    const refreshToken = randomUUID();

    await redisClient.setEx(
      `refreshToken:${refreshToken}`,
      REFRESH_TOKEN_EXPIRATION_SECONDS, // 7 day
      user.id.toString() // store the user ID in Redis
    );

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role },
    };
  },

  async refreshAccessToken(providedRefreshToken: string) {
    if (!providedRefreshToken) {
      throw new HTTPException(401, { message: "Refresh token not found" });
    }

    const userId = await redisClient.get(
      `refreshToken:${providedRefreshToken}`
    );

    if (!userId) {
      throw new HTTPException(401, {
        message: "Invalid or expired refresh token",
      });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, parseInt(userId, 10)));

    if (!user) {
      throw new HTTPException(401, {
        message: "User not found for this token",
      });
    }

    const newAccessTokenPayload = {
      sub: user.id.toString(),
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 60 * 15, // 15 minutes
    };
    const newAccessToken = await sign(newAccessTokenPayload, config.jwtSecret);

    return { newAccessToken };
  },

  async logoutUser(providedRefreshToken: string) {
    if (!providedRefreshToken) {
      return;
    }
    await redisClient.del(`refreshToken:${providedRefreshToken}`);
  },
};

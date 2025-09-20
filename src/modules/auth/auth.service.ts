import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sign } from "hono/jwt";
import { config } from "@/config";
import { HTTPException } from "hono/http-exception";
import type { z } from "zod";
import type { registerSchema, loginSchema } from "./auth.validation";

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

    const payload = {
      sub: user.id.toString(),
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
    };
    
    const res = {
      accessToken: await sign(payload, config.jwtSecret),
    };
    return res;
  },
};

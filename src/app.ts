import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";

import authRoutes from "@/modules/auth/auth.route";
import postRoutes from "@/modules/posts/posts.route";
import { AppEnv } from "./shared/types/hono";

const app = new Hono<AppEnv>().basePath("/api");

// --- Global Middleware ---
app.use("*", logger());
app.use("*", cors());

// --- Routes ---
app.get("/", (c) => c.text("Welcome to the Bun Hono API!"));
app.route("/auth", authRoutes);
app.route("/posts", postRoutes);

// --- Global Error Handler ---
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json(
      {
        status: "error",
        message: err.message,
      },
      err.status
    );
  }
  console.error("Unhandled Error:", err);
  return c.json(
    {
      status: "error",
      message: "An internal server error occurred.",
    },
    500
  );
});

export default app;

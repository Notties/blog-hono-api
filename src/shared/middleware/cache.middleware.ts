import { createMiddleware } from "hono/factory";
import { redisClient } from "@/shared/utils/redis";

export const cache = (options: { key: string; ttl: number }) => {
  return createMiddleware(async (c, next) => {
    if (!redisClient.isReady) {
      console.warn("Redis is not connected, skipping cache.");
      return await next();
    }
    const cachedResponse = await redisClient.get(options.key);
    if (cachedResponse) {
      c.header("X-Cache", "hit");
      return c.json(JSON.parse(cachedResponse));
    }

    await next();

    if (c.res.ok) {
      c.header("X-Cache", "miss");
      const body = await c.res.json();
      await redisClient.setEx(options.key, options.ttl, JSON.stringify(body));
      c.res = c.json(body);
    }
  });
};

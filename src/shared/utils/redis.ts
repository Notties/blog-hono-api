import { config } from "@/config";
import { createClient } from "redis";

export const redisClient = createClient({ url: config.redisUrl });

redisClient.on("error", (err) => console.log("Redis Client Error", err));
redisClient.on("connect", () => console.log("Redis client connected"));

redisClient.connect();

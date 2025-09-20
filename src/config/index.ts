import "dotenv/config";

export const config = {
  port: process.env.PORT || 3000 as number,
  databaseUrl: process.env.DATABASE_URL as string,
  jwtSecret: process.env.JWT_SECRET as string,
  redisUrl: process.env.REDIS_URL as string,
};

if (!config.databaseUrl || !config.jwtSecret || !config.redisUrl) {
  console.error("Missing required environment variables!");
  process.exit(1);
}

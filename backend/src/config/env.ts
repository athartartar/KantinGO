import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().default(""),
  JWT_SECRET: z.string().default("kantingo-dev-jwt-secret-key-32-chars!"),
  ADMIN_API_KEY: z.string().default("kantingo-dev-admin-api-key"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export const env = envSchema.parse(process.env);

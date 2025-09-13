import * as z from 'zod';

export const configSchema = z.object({
  DB_HOST: z.string(),
  DB_PORT: z.string().transform(Number),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  DATABASE_URL: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().transform(Number),
  JWT_SECRET_KEY: z.string(),
  JWT_EXPIRY_TIME: z.string().transform(Number),
  JWT_ALGORITHM: z.string(),
  JWT_AUDIENCE: z.string(),
  JWT_ISSUER: z.string(),
});

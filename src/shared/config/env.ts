import { z } from 'zod/v4';
import dotenv from 'dotenv';

dotenv.config();

function buildDatabaseUrl(
  client: 'pg' | 'mysql2',
  host: string,
  user: string,
  password: string,
  database: string,
  port: number
): string {
  const scheme = client === 'pg' ? 'postgresql' : 'mysql';
  const encodedUser = encodeURIComponent(user);
  const encodedPassword = encodeURIComponent(password);
  return `${scheme}://${encodedUser}:${encodedPassword}@${host}:${port}/${database}`;
}

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().default(3000),
    DB_CLIENT: z.enum(['pg', 'mysql2']).default('pg'),
    DATABASE_URL: z.url().optional(),
    DATABASE_URL_TEST: z.url().optional(),
    DB_HOST: z.string().optional(),
    DB_USER: z.string().optional(),
    DB_PASSWORD: z.string().optional(),
    DB_NAME: z.string().optional(),
    DB_PORT: z.coerce.number().optional(),
    DB_NAME_TEST: z.string().optional(),
    JWT_SECRET: z.string().min(1),
    JWT_EXPIRES_IN: z.string().default('24h'),
    BCRYPT_SALT_ROUNDS: z.coerce.number().default(10),
  })
  .refine(
    (data) => {
      const hasUrl = !!data.DATABASE_URL;
      const hasComponents =
        !!data.DB_HOST && !!data.DB_USER && data.DB_PASSWORD !== undefined && !!data.DB_NAME;
      return hasUrl || hasComponents;
    },
    { message: 'Either DATABASE_URL or (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME) must be set' }
  );

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:');
  console.error(parsed.error.format());
  process.exit(1);
}

const raw = parsed.data;
const defaultPort = raw.DB_CLIENT === 'pg' ? 5432 : 3306;
const dbPort = raw.DB_PORT ?? defaultPort;

const DATABASE_URL =
  raw.DATABASE_URL ??
  (raw.DB_HOST && raw.DB_USER && raw.DB_PASSWORD !== undefined && raw.DB_NAME
    ? buildDatabaseUrl(
        raw.DB_CLIENT,
        raw.DB_HOST,
        raw.DB_USER,
        raw.DB_PASSWORD,
        raw.DB_NAME,
        dbPort
      )
    : '');

const DATABASE_URL_TEST =
  raw.DATABASE_URL_TEST ??
  (raw.DB_HOST && raw.DB_USER && raw.DB_PASSWORD !== undefined && raw.DB_NAME_TEST
    ? buildDatabaseUrl(
        raw.DB_CLIENT,
        raw.DB_HOST,
        raw.DB_USER,
        raw.DB_PASSWORD,
        raw.DB_NAME_TEST,
        dbPort
      )
    : DATABASE_URL);

export const env = {
  ...raw,
  DATABASE_URL,
  DATABASE_URL_TEST,
};


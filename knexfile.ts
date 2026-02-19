import type { Knex } from 'knex';
import { env } from './src/shared/config/env';

const config: Record<string, Knex.Config> = {
  development: {
    client: env.DB_CLIENT,
    connection: env.DATABASE_URL,
    migrations: {
      directory: './src/infrastructure/database/migrations',
      extension: 'ts',
    },
    seeds: {
      directory: './src/infrastructure/database/seeds',
      extension: 'ts',
    },
  },
  test: {
    client: env.DB_CLIENT,
    connection: env.DATABASE_URL_TEST,
    migrations: {
      directory: './src/infrastructure/database/migrations',
      extension: 'ts',
    },
    seeds: {
      directory: './src/infrastructure/database/seeds',
      extension: 'ts',
    },
  },
  production: {
    client: env.DB_CLIENT,
    connection: env.DATABASE_URL,
    migrations: {
      directory: './dist/infrastructure/database/migrations',
    },
    seeds: {
      directory: './dist/infrastructure/database/seeds',
    },
    pool: {
      min: 2,
      max: 10,
    },
  },
};

export default config;

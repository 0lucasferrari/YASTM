import type { Knex } from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const config: Record<string, Knex.Config> = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
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
    client: 'pg',
    connection: process.env.DATABASE_URL_TEST || process.env.DATABASE_URL,
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
    client: 'pg',
    connection: process.env.DATABASE_URL,
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


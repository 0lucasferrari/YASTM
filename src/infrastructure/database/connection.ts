import knex from 'knex';
import { env } from '../../shared/config/env';

const connection = knex({
  client: 'pg',
  connection: env.NODE_ENV === 'test'
    ? (env.DATABASE_URL_TEST || env.DATABASE_URL)
    : env.DATABASE_URL,
  pool: {
    min: 2,
    max: 10,
  },
});

export default connection;


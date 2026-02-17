import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const client = knex.client.config.client;
  if (client === 'pg') {
    await knex.raw(`CREATE TYPE task_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')`);
  }
  // MySQL uses inline ENUM on the column definition — no separate type needed.
}

export async function down(knex: Knex): Promise<void> {
  const client = knex.client.config.client;
  if (client === 'pg') {
    await knex.raw(`DROP TYPE IF EXISTS task_priority`);
  }
}

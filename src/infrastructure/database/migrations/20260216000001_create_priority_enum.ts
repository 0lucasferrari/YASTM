import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`CREATE TYPE task_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP TYPE IF EXISTS task_priority`);
}


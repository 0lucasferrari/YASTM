import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('task_statuses', (table) => {
    table.uuid('task_id').notNullable().references('id').inTable('tasks').onDelete('CASCADE');
    table.uuid('status_id').notNullable().references('id').inTable('statuses').onDelete('CASCADE');
    table.primary(['task_id', 'status_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('task_statuses');
}


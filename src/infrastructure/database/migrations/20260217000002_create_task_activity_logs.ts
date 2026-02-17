import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('task_activity_logs', (table) => {
    table.uuid('id').primary().notNullable();
    table.uuid('task_id').notNullable().references('id').inTable('tasks');
    table.uuid('user_id').notNullable().references('id').inTable('users');
    table.string('action', 50).notNullable();
    table.string('field', 100).nullable();
    table.text('old_value').nullable();
    table.text('new_value').nullable();
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index(['task_id', 'created_at'], 'idx_task_activity_logs_task_created');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('task_activity_logs');
}


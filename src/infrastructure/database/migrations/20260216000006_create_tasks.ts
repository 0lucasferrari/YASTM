import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('tasks', (table) => {
    table.uuid('id').primary().notNullable();
    table.string('title', 255).notNullable();
    table.text('description').nullable();
    table.uuid('parent_task_id').nullable().references('id').inTable('tasks');
    table.uuid('assignor_id').notNullable().references('id').inTable('users');
    table.uuid('current_status_id').nullable().references('id').inTable('statuses');

    const client = knex.client.config.client;
    if (client === 'pg') {
      table.specificType('priority', 'task_priority').nullable();
    } else {
      table.enum('priority', ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).nullable();
    }

    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.uuid('created_by').nullable().references('id').inTable('users');
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.uuid('updated_by').nullable().references('id').inTable('users');
    table.timestamp('deleted_at', { useTz: true }).nullable();
    table.uuid('deleted_by').nullable().references('id').inTable('users');

    table.index('assignor_id');
    table.index('parent_task_id');
    table.index('current_status_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('tasks');
}


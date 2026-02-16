import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('comments', (table) => {
    table.uuid('id').primary().notNullable();
    table.uuid('task_id').notNullable().references('id').inTable('tasks');
    table.uuid('creator_id').notNullable().references('id').inTable('users');
    table.text('content').notNullable();
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.uuid('created_by').nullable().references('id').inTable('users');
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.uuid('updated_by').nullable().references('id').inTable('users');
    table.timestamp('deleted_at', { useTz: true }).nullable();
    table.uuid('deleted_by').nullable().references('id').inTable('users');

    table.index('task_id');
    table.index('creator_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('comments');
}


import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('statuses', (table) => {
    table.uuid('id').primary().notNullable();
    table.string('title', 255).notNullable();
    table.text('description').nullable();
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.uuid('created_by').nullable().references('id').inTable('users');
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.uuid('updated_by').nullable().references('id').inTable('users');
    table.timestamp('deleted_at', { useTz: true }).nullable();
    table.uuid('deleted_by').nullable().references('id').inTable('users');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('statuses');
}


import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().notNullable();
    table.string('name', 255).notNullable();
    table.string('email', 255).notNullable().unique();
    table.string('password', 255).notNullable();
    table.uuid('team_id').nullable().references('id').inTable('teams');
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.uuid('created_by').nullable();
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.uuid('updated_by').nullable();
    table.timestamp('deleted_at', { useTz: true }).nullable();
    table.uuid('deleted_by').nullable();
  });

  // Add foreign keys for audit columns on teams (now that users table exists)
  await knex.schema.alterTable('teams', (table) => {
    table.foreign('created_by').references('id').inTable('users');
    table.foreign('updated_by').references('id').inTable('users');
    table.foreign('deleted_by').references('id').inTable('users');
  });

  // Self-referencing audit FKs on users
  await knex.schema.alterTable('users', (table) => {
    table.foreign('created_by').references('id').inTable('users');
    table.foreign('updated_by').references('id').inTable('users');
    table.foreign('deleted_by').references('id').inTable('users');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('teams', (table) => {
    table.dropForeign(['created_by']);
    table.dropForeign(['updated_by']);
    table.dropForeign(['deleted_by']);
  });
  await knex.schema.dropTableIfExists('users');
}


import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('task_labels', (table) => {
    table.uuid('task_id').notNullable().references('id').inTable('tasks').onDelete('CASCADE');
    table.uuid('label_id').notNullable().references('id').inTable('labels').onDelete('CASCADE');
    table.primary(['task_id', 'label_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('task_labels');
}


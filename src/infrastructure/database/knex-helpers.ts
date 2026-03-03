import type { Knex } from 'knex';

/**
 * MySQL does not support .returning(). These helpers use insert/update + select
 * for all databases to ensure compatibility with both PostgreSQL and MySQL.
 */

function buildWhere(db: Knex, table: string, id: string, idColumn: string, softDelete: boolean) {
  let q = db(table).where({ [idColumn]: id });
  if (softDelete) q = q.whereNull('deleted_at');
  return q;
}

export async function insertAndReturn<T extends Record<string, unknown>>(
  db: Knex,
  table: string,
  data: T,
  idColumn: keyof T = 'id' as keyof T,
): Promise<T> {
  await db(table).insert(data);
  const id = data[idColumn as string];
  const row = await db(table).where({ [idColumn as string]: id }).first();
  return (row ?? { ...data, created_at: new Date(), updated_at: new Date() }) as T;
}

export async function updateAndReturn<T>(
  db: Knex,
  table: string,
  id: string,
  data: Record<string, unknown>,
  options?: { idColumn?: string; softDelete?: boolean },
): Promise<T | null> {
  const idColumn = options?.idColumn ?? 'id';
  const softDelete = options?.softDelete ?? true;

  const where = buildWhere(db, table, id, idColumn, softDelete);
  await where.clone().update(data);
  const row = await where.first();
  return (row ?? null) as T | null;
}

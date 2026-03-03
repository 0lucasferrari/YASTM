import { Knex } from 'knex';
import { Status } from '../../domain/entities/Status';
import { IStatusRepository } from '../../domain/repositories/IStatusRepository';
import { insertAndReturn, updateAndReturn } from '../database/knex-helpers';

export class KnexStatusRepository implements IStatusRepository {
  constructor(private readonly db: Knex) {}

  async findById(id: string): Promise<Status | null> {
    const status = await this.db('statuses')
      .where({ id })
      .whereNull('deleted_at')
      .first();
    return status || null;
  }

  async findAll(): Promise<Status[]> {
    return this.db('statuses').whereNull('deleted_at');
  }

  async create(status: Omit<Status, 'created_at' | 'updated_at' | 'deleted_at' | 'deleted_by'>): Promise<Status> {
    return insertAndReturn(this.db, 'statuses', status as Record<string, unknown>) as unknown as Promise<Status>;
  }

  async update(id: string, data: Partial<Pick<Status, 'title' | 'description' | 'updated_by'>>): Promise<Status | null> {
    return updateAndReturn<Status>(this.db, 'statuses', id, { ...data, updated_at: this.db.fn.now() });
  }

  async softDelete(id: string, deletedBy: string): Promise<void> {
    await this.db('statuses')
      .where({ id })
      .whereNull('deleted_at')
      .update({
        deleted_at: this.db.fn.now(),
        deleted_by: deletedBy,
      });
  }
}


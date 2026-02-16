import { Knex } from 'knex';
import { Status } from '../../domain/entities/Status';
import { IStatusRepository } from '../../domain/repositories/IStatusRepository';

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
    const [created] = await this.db('statuses')
      .insert(status)
      .returning('*');
    return created;
  }

  async update(id: string, data: Partial<Pick<Status, 'title' | 'description' | 'updated_by'>>): Promise<Status | null> {
    const [updated] = await this.db('statuses')
      .where({ id })
      .whereNull('deleted_at')
      .update({ ...data, updated_at: this.db.fn.now() })
      .returning('*');
    return updated || null;
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


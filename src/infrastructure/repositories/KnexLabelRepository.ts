import { Knex } from 'knex';
import { Label } from '../../domain/entities/Label';
import { ILabelRepository } from '../../domain/repositories/ILabelRepository';

export class KnexLabelRepository implements ILabelRepository {
  constructor(private readonly db: Knex) {}

  async findById(id: string): Promise<Label | null> {
    const label = await this.db('labels')
      .where({ id })
      .whereNull('deleted_at')
      .first();
    return label || null;
  }

  async findAll(): Promise<Label[]> {
    return this.db('labels').whereNull('deleted_at');
  }

  async create(label: Omit<Label, 'created_at' | 'updated_at' | 'deleted_at' | 'deleted_by'>): Promise<Label> {
    const [created] = await this.db('labels')
      .insert(label)
      .returning('*');
    return created;
  }

  async update(id: string, data: Partial<Pick<Label, 'title' | 'description' | 'updated_by'>>): Promise<Label | null> {
    const [updated] = await this.db('labels')
      .where({ id })
      .whereNull('deleted_at')
      .update({ ...data, updated_at: this.db.fn.now() })
      .returning('*');
    return updated || null;
  }

  async softDelete(id: string, deletedBy: string): Promise<void> {
    await this.db('labels')
      .where({ id })
      .whereNull('deleted_at')
      .update({
        deleted_at: this.db.fn.now(),
        deleted_by: deletedBy,
      });
  }
}


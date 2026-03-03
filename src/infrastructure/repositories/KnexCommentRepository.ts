import { Knex } from 'knex';
import { Comment } from '../../domain/entities/Comment';
import { ICommentRepository } from '../../domain/repositories/ICommentRepository';
import { insertAndReturn, updateAndReturn } from '../database/knex-helpers';

export class KnexCommentRepository implements ICommentRepository {
  constructor(private readonly db: Knex) {}

  async findById(id: string): Promise<Comment | null> {
    const comment = await this.db('comments')
      .where({ id })
      .whereNull('deleted_at')
      .first();
    return comment || null;
  }

  async findByTaskId(taskId: string): Promise<Comment[]> {
    return this.db('comments')
      .where({ task_id: taskId })
      .whereNull('deleted_at');
  }

  async create(comment: Omit<Comment, 'created_at' | 'updated_at' | 'deleted_at' | 'deleted_by'>): Promise<Comment> {
    return insertAndReturn(this.db, 'comments', comment as Record<string, unknown>) as unknown as Promise<Comment>;
  }

  async update(id: string, data: Partial<Pick<Comment, 'content' | 'updated_by'>>): Promise<Comment | null> {
    return updateAndReturn<Comment>(this.db, 'comments', id, { ...data, updated_at: this.db.fn.now() });
  }

  async softDelete(id: string, deletedBy: string): Promise<void> {
    await this.db('comments')
      .where({ id })
      .whereNull('deleted_at')
      .update({
        deleted_at: this.db.fn.now(),
        deleted_by: deletedBy,
      });
  }
}


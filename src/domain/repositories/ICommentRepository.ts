import { Comment } from '../entities/Comment';

export interface ICommentRepository {
  findById(id: string): Promise<Comment | null>;
  findByTaskId(taskId: string): Promise<Comment[]>;
  create(comment: Omit<Comment, 'created_at' | 'updated_at' | 'deleted_at' | 'deleted_by'>): Promise<Comment>;
  update(id: string, data: Partial<Pick<Comment, 'content' | 'updated_by'>>): Promise<Comment | null>;
  softDelete(id: string, deletedBy: string): Promise<void>;
}


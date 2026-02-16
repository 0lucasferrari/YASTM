import { Status } from '../entities/Status';

export interface IStatusRepository {
  findById(id: string): Promise<Status | null>;
  findAll(): Promise<Status[]>;
  create(status: Omit<Status, 'created_at' | 'updated_at' | 'deleted_at' | 'deleted_by'>): Promise<Status>;
  update(id: string, data: Partial<Pick<Status, 'title' | 'description' | 'updated_by'>>): Promise<Status | null>;
  softDelete(id: string, deletedBy: string): Promise<void>;
}


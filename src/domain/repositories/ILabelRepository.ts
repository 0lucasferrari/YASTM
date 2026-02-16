import { Label } from '../entities/Label';

export interface ILabelRepository {
  findById(id: string): Promise<Label | null>;
  findAll(): Promise<Label[]>;
  create(label: Omit<Label, 'created_at' | 'updated_at' | 'deleted_at' | 'deleted_by'>): Promise<Label>;
  update(id: string, data: Partial<Pick<Label, 'title' | 'description' | 'updated_by'>>): Promise<Label | null>;
  softDelete(id: string, deletedBy: string): Promise<void>;
}


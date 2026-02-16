import { User } from '../entities/User';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  create(user: Omit<User, 'created_at' | 'updated_at' | 'deleted_at' | 'deleted_by'>): Promise<User>;
  update(id: string, data: Partial<Pick<User, 'name' | 'email' | 'password' | 'team_id' | 'updated_by'>>): Promise<User | null>;
  softDelete(id: string, deletedBy: string): Promise<void>;
}


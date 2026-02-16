import { Knex } from 'knex';
import { User } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/repositories/IUserRepository';

export class KnexUserRepository implements IUserRepository {
  constructor(private readonly db: Knex) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.db('users')
      .where({ id })
      .whereNull('deleted_at')
      .first();
    return user || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.db('users')
      .where({ email })
      .whereNull('deleted_at')
      .first();
    return user || null;
  }

  async findAll(): Promise<User[]> {
    return this.db('users').whereNull('deleted_at');
  }

  async create(user: Omit<User, 'created_at' | 'updated_at' | 'deleted_at' | 'deleted_by'>): Promise<User> {
    const [created] = await this.db('users')
      .insert(user)
      .returning('*');
    return created;
  }

  async update(id: string, data: Partial<Pick<User, 'name' | 'email' | 'password' | 'team_id' | 'updated_by'>>): Promise<User | null> {
    const [updated] = await this.db('users')
      .where({ id })
      .whereNull('deleted_at')
      .update({ ...data, updated_at: this.db.fn.now() })
      .returning('*');
    return updated || null;
  }

  async softDelete(id: string, deletedBy: string): Promise<void> {
    await this.db('users')
      .where({ id })
      .whereNull('deleted_at')
      .update({
        deleted_at: this.db.fn.now(),
        deleted_by: deletedBy,
      });
  }
}


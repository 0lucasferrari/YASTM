import { Knex } from 'knex';
import { Team } from '../../domain/entities/Team';
import { ITeamRepository } from '../../domain/repositories/ITeamRepository';

export class KnexTeamRepository implements ITeamRepository {
  constructor(private readonly db: Knex) {}

  async findById(id: string): Promise<Team | null> {
    const team = await this.db('teams')
      .where({ id })
      .whereNull('deleted_at')
      .first();
    return team || null;
  }

  async findAll(): Promise<Team[]> {
    return this.db('teams').whereNull('deleted_at');
  }

  async create(team: Omit<Team, 'created_at' | 'updated_at' | 'deleted_at' | 'deleted_by'>): Promise<Team> {
    const [created] = await this.db('teams')
      .insert(team)
      .returning('*');
    return created;
  }

  async update(id: string, data: Partial<Pick<Team, 'name' | 'updated_by'>>): Promise<Team | null> {
    const [updated] = await this.db('teams')
      .where({ id })
      .whereNull('deleted_at')
      .update({ ...data, updated_at: this.db.fn.now() })
      .returning('*');
    return updated || null;
  }

  async softDelete(id: string, deletedBy: string): Promise<void> {
    await this.db('teams')
      .where({ id })
      .whereNull('deleted_at')
      .update({
        deleted_at: this.db.fn.now(),
        deleted_by: deletedBy,
      });
  }
}


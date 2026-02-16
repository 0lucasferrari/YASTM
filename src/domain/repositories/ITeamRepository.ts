import { Team } from '../entities/Team';

export interface ITeamRepository {
  findById(id: string): Promise<Team | null>;
  findAll(): Promise<Team[]>;
  create(team: Omit<Team, 'created_at' | 'updated_at' | 'deleted_at' | 'deleted_by'>): Promise<Team>;
  update(id: string, data: Partial<Pick<Team, 'name' | 'updated_by'>>): Promise<Team | null>;
  softDelete(id: string, deletedBy: string): Promise<void>;
}


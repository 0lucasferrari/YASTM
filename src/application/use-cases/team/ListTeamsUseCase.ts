import { IUseCase } from '../../interfaces/IUseCase';
import { TeamOutputDTO } from '../../dtos/team/TeamDTO';
import { ITeamRepository } from '../../../domain/repositories/ITeamRepository';

export class ListTeamsUseCase implements IUseCase<void, TeamOutputDTO[]> {
  constructor(private readonly teamRepository: ITeamRepository) {}

  async execute(): Promise<TeamOutputDTO[]> {
    const teams = await this.teamRepository.findAll();
    return teams.map((team) => ({
      id: team.id,
      name: team.name,
      created_at: team.created_at,
      updated_at: team.updated_at,
    }));
  }
}


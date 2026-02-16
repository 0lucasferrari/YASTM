import { IUseCase } from '../../interfaces/IUseCase';
import { TeamOutputDTO } from '../../dtos/team/TeamDTO';
import { ITeamRepository } from '../../../domain/repositories/ITeamRepository';
import { AppError } from '../../../domain/errors/AppError';

export class GetTeamUseCase implements IUseCase<string, TeamOutputDTO> {
  constructor(private readonly teamRepository: ITeamRepository) {}

  async execute(id: string): Promise<TeamOutputDTO> {
    const team = await this.teamRepository.findById(id);
    if (!team) {
      throw new AppError('Team not found', 404);
    }

    return {
      id: team.id,
      name: team.name,
      created_at: team.created_at,
      updated_at: team.updated_at,
    };
  }
}


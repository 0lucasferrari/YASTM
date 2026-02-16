import { IUseCase } from '../../interfaces/IUseCase';
import { UpdateTeamInputDTO, TeamOutputDTO } from '../../dtos/team/TeamDTO';
import { ITeamRepository } from '../../../domain/repositories/ITeamRepository';
import { AppError } from '../../../domain/errors/AppError';

export class UpdateTeamUseCase implements IUseCase<UpdateTeamInputDTO, TeamOutputDTO> {
  constructor(private readonly teamRepository: ITeamRepository) {}

  async execute(input: UpdateTeamInputDTO): Promise<TeamOutputDTO> {
    const existing = await this.teamRepository.findById(input.id);
    if (!existing) {
      throw new AppError('Team not found', 404);
    }

    const updated = await this.teamRepository.update(input.id, {
      name: input.name,
      updated_by: input.updated_by,
    });

    if (!updated) {
      throw new AppError('Failed to update team', 500);
    }

    return {
      id: updated.id,
      name: updated.name,
      created_at: updated.created_at,
      updated_at: updated.updated_at,
    };
  }
}


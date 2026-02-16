import { IUseCase } from '../../interfaces/IUseCase';
import { ITeamRepository } from '../../../domain/repositories/ITeamRepository';
import { AppError } from '../../../domain/errors/AppError';

interface DeleteTeamInputDTO {
  id: string;
  deleted_by: string;
}

export class DeleteTeamUseCase implements IUseCase<DeleteTeamInputDTO, void> {
  constructor(private readonly teamRepository: ITeamRepository) {}

  async execute(input: DeleteTeamInputDTO): Promise<void> {
    const team = await this.teamRepository.findById(input.id);
    if (!team) {
      throw new AppError('Team not found', 404);
    }

    await this.teamRepository.softDelete(input.id, input.deleted_by);
  }
}


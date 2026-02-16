import { v4 as uuidv4 } from 'uuid';
import { IUseCase } from '../../interfaces/IUseCase';
import { CreateTeamInputDTO, TeamOutputDTO } from '../../dtos/team/TeamDTO';
import { ITeamRepository } from '../../../domain/repositories/ITeamRepository';

export class CreateTeamUseCase implements IUseCase<CreateTeamInputDTO, TeamOutputDTO> {
  constructor(private readonly teamRepository: ITeamRepository) {}

  async execute(input: CreateTeamInputDTO): Promise<TeamOutputDTO> {
    const team = await this.teamRepository.create({
      id: uuidv4(),
      name: input.name,
      created_by: input.created_by,
      updated_by: input.created_by,
    });

    return {
      id: team.id,
      name: team.name,
      created_at: team.created_at,
      updated_at: team.updated_at,
    };
  }
}


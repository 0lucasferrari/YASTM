import { v4 as uuidv4 } from 'uuid';
import { IUseCase } from '../../interfaces/IUseCase';
import { CreateStatusInputDTO, StatusOutputDTO } from '../../dtos/status/StatusDTO';
import { IStatusRepository } from '../../../domain/repositories/IStatusRepository';

export class CreateStatusUseCase implements IUseCase<CreateStatusInputDTO, StatusOutputDTO> {
  constructor(private readonly statusRepository: IStatusRepository) {}

  async execute(input: CreateStatusInputDTO): Promise<StatusOutputDTO> {
    const status = await this.statusRepository.create({
      id: uuidv4(),
      title: input.title,
      description: input.description ?? null,
      created_by: input.created_by,
      updated_by: input.created_by,
    });

    return {
      id: status.id,
      title: status.title,
      description: status.description,
      created_at: status.created_at,
      updated_at: status.updated_at,
    };
  }
}


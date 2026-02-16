import { IUseCase } from '../../interfaces/IUseCase';
import { StatusOutputDTO } from '../../dtos/status/StatusDTO';
import { IStatusRepository } from '../../../domain/repositories/IStatusRepository';
import { AppError } from '../../../domain/errors/AppError';

export class GetStatusUseCase implements IUseCase<string, StatusOutputDTO> {
  constructor(private readonly statusRepository: IStatusRepository) {}

  async execute(id: string): Promise<StatusOutputDTO> {
    const status = await this.statusRepository.findById(id);
    if (!status) {
      throw new AppError('Status not found', 404);
    }

    return {
      id: status.id,
      title: status.title,
      description: status.description,
      created_at: status.created_at,
      updated_at: status.updated_at,
    };
  }
}


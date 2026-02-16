import { IUseCase } from '../../interfaces/IUseCase';
import { UpdateStatusInputDTO, StatusOutputDTO } from '../../dtos/status/StatusDTO';
import { IStatusRepository } from '../../../domain/repositories/IStatusRepository';
import { AppError } from '../../../domain/errors/AppError';

export class UpdateStatusUseCase implements IUseCase<UpdateStatusInputDTO, StatusOutputDTO> {
  constructor(private readonly statusRepository: IStatusRepository) {}

  async execute(input: UpdateStatusInputDTO): Promise<StatusOutputDTO> {
    const existing = await this.statusRepository.findById(input.id);
    if (!existing) {
      throw new AppError('Status not found', 404);
    }

    const updated = await this.statusRepository.update(input.id, {
      title: input.title,
      description: input.description,
      updated_by: input.updated_by,
    });

    if (!updated) {
      throw new AppError('Failed to update status', 500);
    }

    return {
      id: updated.id,
      title: updated.title,
      description: updated.description,
      created_at: updated.created_at,
      updated_at: updated.updated_at,
    };
  }
}


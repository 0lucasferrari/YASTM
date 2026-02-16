import { IUseCase } from '../../interfaces/IUseCase';
import { IStatusRepository } from '../../../domain/repositories/IStatusRepository';
import { AppError } from '../../../domain/errors/AppError';

interface DeleteStatusInputDTO {
  id: string;
  deleted_by: string;
}

export class DeleteStatusUseCase implements IUseCase<DeleteStatusInputDTO, void> {
  constructor(private readonly statusRepository: IStatusRepository) {}

  async execute(input: DeleteStatusInputDTO): Promise<void> {
    const status = await this.statusRepository.findById(input.id);
    if (!status) {
      throw new AppError('Status not found', 404);
    }

    await this.statusRepository.softDelete(input.id, input.deleted_by);
  }
}


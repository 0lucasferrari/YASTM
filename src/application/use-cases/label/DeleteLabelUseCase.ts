import { IUseCase } from '../../interfaces/IUseCase';
import { ILabelRepository } from '../../../domain/repositories/ILabelRepository';
import { AppError } from '../../../domain/errors/AppError';

interface DeleteLabelInputDTO {
  id: string;
  deleted_by: string;
}

export class DeleteLabelUseCase implements IUseCase<DeleteLabelInputDTO, void> {
  constructor(private readonly labelRepository: ILabelRepository) {}

  async execute(input: DeleteLabelInputDTO): Promise<void> {
    const label = await this.labelRepository.findById(input.id);
    if (!label) {
      throw new AppError('Label not found', 404);
    }

    await this.labelRepository.softDelete(input.id, input.deleted_by);
  }
}


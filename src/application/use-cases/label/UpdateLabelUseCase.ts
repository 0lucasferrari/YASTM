import { IUseCase } from '../../interfaces/IUseCase';
import { UpdateLabelInputDTO, LabelOutputDTO } from '../../dtos/label/LabelDTO';
import { ILabelRepository } from '../../../domain/repositories/ILabelRepository';
import { AppError } from '../../../domain/errors/AppError';

export class UpdateLabelUseCase implements IUseCase<UpdateLabelInputDTO, LabelOutputDTO> {
  constructor(private readonly labelRepository: ILabelRepository) {}

  async execute(input: UpdateLabelInputDTO): Promise<LabelOutputDTO> {
    const existing = await this.labelRepository.findById(input.id);
    if (!existing) {
      throw new AppError('Label not found', 404);
    }

    const updated = await this.labelRepository.update(input.id, {
      title: input.title,
      description: input.description,
      updated_by: input.updated_by,
    });

    if (!updated) {
      throw new AppError('Failed to update label', 500);
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


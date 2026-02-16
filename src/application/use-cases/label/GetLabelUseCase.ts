import { IUseCase } from '../../interfaces/IUseCase';
import { LabelOutputDTO } from '../../dtos/label/LabelDTO';
import { ILabelRepository } from '../../../domain/repositories/ILabelRepository';
import { AppError } from '../../../domain/errors/AppError';

export class GetLabelUseCase implements IUseCase<string, LabelOutputDTO> {
  constructor(private readonly labelRepository: ILabelRepository) {}

  async execute(id: string): Promise<LabelOutputDTO> {
    const label = await this.labelRepository.findById(id);
    if (!label) {
      throw new AppError('Label not found', 404);
    }

    return {
      id: label.id,
      title: label.title,
      description: label.description,
      created_at: label.created_at,
      updated_at: label.updated_at,
    };
  }
}


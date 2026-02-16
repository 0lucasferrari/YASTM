import { IUseCase } from '../../interfaces/IUseCase';
import { LabelOutputDTO } from '../../dtos/label/LabelDTO';
import { ILabelRepository } from '../../../domain/repositories/ILabelRepository';

export class ListLabelsUseCase implements IUseCase<void, LabelOutputDTO[]> {
  constructor(private readonly labelRepository: ILabelRepository) {}

  async execute(): Promise<LabelOutputDTO[]> {
    const labels = await this.labelRepository.findAll();
    return labels.map((label) => ({
      id: label.id,
      title: label.title,
      description: label.description,
      created_at: label.created_at,
      updated_at: label.updated_at,
    }));
  }
}


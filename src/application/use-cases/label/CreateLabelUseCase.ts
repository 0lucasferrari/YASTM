import { v4 as uuidv4 } from 'uuid';
import { IUseCase } from '../../interfaces/IUseCase';
import { CreateLabelInputDTO, LabelOutputDTO } from '../../dtos/label/LabelDTO';
import { ILabelRepository } from '../../../domain/repositories/ILabelRepository';

export class CreateLabelUseCase implements IUseCase<CreateLabelInputDTO, LabelOutputDTO> {
  constructor(private readonly labelRepository: ILabelRepository) {}

  async execute(input: CreateLabelInputDTO): Promise<LabelOutputDTO> {
    const label = await this.labelRepository.create({
      id: uuidv4(),
      title: input.title,
      description: input.description ?? null,
      created_by: input.created_by,
      updated_by: input.created_by,
    });

    return {
      id: label.id,
      title: label.title,
      description: label.description,
      created_at: label.created_at,
      updated_at: label.updated_at,
    };
  }
}


import { IUseCase } from '../../interfaces/IUseCase';
import { StatusOutputDTO } from '../../dtos/status/StatusDTO';
import { IStatusRepository } from '../../../domain/repositories/IStatusRepository';

export class ListStatusesUseCase implements IUseCase<void, StatusOutputDTO[]> {
  constructor(private readonly statusRepository: IStatusRepository) {}

  async execute(): Promise<StatusOutputDTO[]> {
    const statuses = await this.statusRepository.findAll();
    return statuses.map((status) => ({
      id: status.id,
      title: status.title,
      description: status.description,
      created_at: status.created_at,
      updated_at: status.updated_at,
    }));
  }
}


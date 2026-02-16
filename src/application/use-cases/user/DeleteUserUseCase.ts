import { IUseCase } from '../../interfaces/IUseCase';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { AppError } from '../../../domain/errors/AppError';

interface DeleteUserInputDTO {
  id: string;
  deleted_by: string;
}

export class DeleteUserUseCase implements IUseCase<DeleteUserInputDTO, void> {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: DeleteUserInputDTO): Promise<void> {
    const user = await this.userRepository.findById(input.id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    await this.userRepository.softDelete(input.id, input.deleted_by);
  }
}


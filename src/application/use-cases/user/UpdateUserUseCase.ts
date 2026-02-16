import { IUseCase } from '../../interfaces/IUseCase';
import { UpdateUserInputDTO, UserOutputDTO } from '../../dtos/user/UserDTO';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { AppError } from '../../../domain/errors/AppError';

export class UpdateUserUseCase implements IUseCase<UpdateUserInputDTO, UserOutputDTO> {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: UpdateUserInputDTO): Promise<UserOutputDTO> {
    const existing = await this.userRepository.findById(input.id);
    if (!existing) {
      throw new AppError('User not found', 404);
    }

    if (input.email && input.email !== existing.email) {
      const emailTaken = await this.userRepository.findByEmail(input.email);
      if (emailTaken) {
        throw new AppError('Email already in use', 409);
      }
    }

    const updated = await this.userRepository.update(input.id, {
      name: input.name,
      email: input.email,
      team_id: input.team_id,
      updated_by: input.updated_by,
    });

    if (!updated) {
      throw new AppError('Failed to update user', 500);
    }

    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      team_id: updated.team_id,
      created_at: updated.created_at,
      updated_at: updated.updated_at,
    };
  }
}


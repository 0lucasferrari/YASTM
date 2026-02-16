import { IUseCase } from '../../interfaces/IUseCase';
import { UserOutputDTO } from '../../dtos/user/UserDTO';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { AppError } from '../../../domain/errors/AppError';

export class GetUserUseCase implements IUseCase<string, UserOutputDTO> {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(id: string): Promise<UserOutputDTO> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      team_id: user.team_id,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }
}


import { IUseCase } from '../../interfaces/IUseCase';
import { UserOutputDTO } from '../../dtos/user/UserDTO';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';

export class ListUsersUseCase implements IUseCase<void, UserOutputDTO[]> {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(): Promise<UserOutputDTO[]> {
    const users = await this.userRepository.findAll();
    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      team_id: user.team_id,
      created_at: user.created_at,
      updated_at: user.updated_at,
    }));
  }
}


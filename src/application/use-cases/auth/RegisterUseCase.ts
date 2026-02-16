import { v4 as uuidv4 } from 'uuid';
import { IUseCase } from '../../interfaces/IUseCase';
import { RegisterInputDTO, RegisterOutputDTO } from '../../dtos/auth/RegisterDTO';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IHashProvider } from '../../../domain/providers/IHashProvider';
import { AppError } from '../../../domain/errors/AppError';

export class RegisterUseCase implements IUseCase<RegisterInputDTO, RegisterOutputDTO> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hashProvider: IHashProvider,
  ) {}

  async execute(input: RegisterInputDTO): Promise<RegisterOutputDTO> {
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new AppError('Email already in use', 409);
    }

    const hashedPassword = await this.hashProvider.hash(input.password);

    const user = await this.userRepository.create({
      id: uuidv4(),
      name: input.name,
      email: input.email,
      password: hashedPassword,
      team_id: null,
      created_by: null,
      updated_by: null,
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.created_at,
    };
  }
}


import { IUseCase } from '../../interfaces/IUseCase';
import { LoginInputDTO, LoginOutputDTO } from '../../dtos/auth/LoginDTO';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IHashProvider } from '../../../domain/providers/IHashProvider';
import { ITokenProvider } from '../../../domain/providers/ITokenProvider';
import { AppError } from '../../../domain/errors/AppError';

export class LoginUseCase implements IUseCase<LoginInputDTO, LoginOutputDTO> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hashProvider: IHashProvider,
    private readonly tokenProvider: ITokenProvider,
  ) {}

  async execute(input: LoginInputDTO): Promise<LoginOutputDTO> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const passwordMatch = await this.hashProvider.compare(input.password, user.password);
    if (!passwordMatch) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = this.tokenProvider.generate({
      sub: user.id,
      email: user.email,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }
}


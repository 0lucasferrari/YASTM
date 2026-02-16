import { LoginUseCase } from '../../src/application/use-cases/auth/LoginUseCase';
import { IUserRepository } from '../../src/domain/repositories/IUserRepository';
import { IHashProvider } from '../../src/domain/providers/IHashProvider';
import { ITokenProvider } from '../../src/domain/providers/ITokenProvider';
import { AppError } from '../../src/domain/errors/AppError';

describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockHashProvider: jest.Mocked<IHashProvider>;
  let mockTokenProvider: jest.Mocked<ITokenProvider>;

  const mockUser = {
    id: 'uuid-123',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashed_password',
    team_id: null,
    created_at: new Date(),
    created_by: null,
    updated_at: new Date(),
    updated_by: null,
    deleted_at: null,
    deleted_by: null,
  };

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };

    mockHashProvider = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    mockTokenProvider = {
      generate: jest.fn(),
      verify: jest.fn(),
    };

    loginUseCase = new LoginUseCase(mockUserRepository, mockHashProvider, mockTokenProvider);
  });

  it('should authenticate a user and return a token', async () => {
    const input = { email: 'john@example.com', password: 'password123' };

    mockUserRepository.findByEmail.mockResolvedValue(mockUser);
    mockHashProvider.compare.mockResolvedValue(true);
    mockTokenProvider.generate.mockReturnValue('jwt-token-123');

    const result = await loginUseCase.execute(input);

    expect(result.token).toBe('jwt-token-123');
    expect(result.user.id).toBe(mockUser.id);
    expect(result.user.email).toBe(mockUser.email);
    expect(mockTokenProvider.generate).toHaveBeenCalledWith({
      sub: mockUser.id,
      email: mockUser.email,
    });
  });

  it('should throw AppError when user is not found', async () => {
    const input = { email: 'unknown@example.com', password: 'password123' };

    mockUserRepository.findByEmail.mockResolvedValue(null);

    await expect(loginUseCase.execute(input)).rejects.toThrow(AppError);
    await expect(loginUseCase.execute(input)).rejects.toMatchObject({
      statusCode: 401,
      message: 'Invalid credentials',
    });
  });

  it('should throw AppError when password does not match', async () => {
    const input = { email: 'john@example.com', password: 'wrong-password' };

    mockUserRepository.findByEmail.mockResolvedValue(mockUser);
    mockHashProvider.compare.mockResolvedValue(false);

    await expect(loginUseCase.execute(input)).rejects.toThrow(AppError);
    await expect(loginUseCase.execute(input)).rejects.toMatchObject({
      statusCode: 401,
      message: 'Invalid credentials',
    });
    expect(mockTokenProvider.generate).not.toHaveBeenCalled();
  });
});


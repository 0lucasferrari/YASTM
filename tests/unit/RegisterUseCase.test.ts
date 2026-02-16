import { RegisterUseCase } from '../../src/application/use-cases/auth/RegisterUseCase';
import { IUserRepository } from '../../src/domain/repositories/IUserRepository';
import { IHashProvider } from '../../src/domain/providers/IHashProvider';
import { AppError } from '../../src/domain/errors/AppError';
import { User } from '../../src/domain/entities/User';

describe('RegisterUseCase', () => {
  let registerUseCase: RegisterUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockHashProvider: jest.Mocked<IHashProvider>;

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

    registerUseCase = new RegisterUseCase(mockUserRepository, mockHashProvider);
  });

  it('should register a new user successfully', async () => {
    const input = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockHashProvider.hash.mockResolvedValue('hashed_password');
    mockUserRepository.create.mockResolvedValue({
      id: 'uuid-123',
      name: input.name,
      email: input.email,
      password: 'hashed_password',
      team_id: null,
      created_at: new Date(),
      created_by: null,
      updated_at: new Date(),
      updated_by: null,
      deleted_at: null,
      deleted_by: null,
    });

    const result = await registerUseCase.execute(input);

    expect(result).toHaveProperty('id');
    expect(result.name).toBe(input.name);
    expect(result.email).toBe(input.email);
    expect(result).not.toHaveProperty('password');
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(input.email);
    expect(mockHashProvider.hash).toHaveBeenCalledWith(input.password);
    expect(mockUserRepository.create).toHaveBeenCalled();
  });

  it('should throw AppError when email is already in use', async () => {
    const input = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    mockUserRepository.findByEmail.mockResolvedValue({
      id: 'existing-uuid',
      name: 'Existing User',
      email: input.email,
      password: 'hashed',
      team_id: null,
      created_at: new Date(),
      created_by: null,
      updated_at: new Date(),
      updated_by: null,
      deleted_at: null,
      deleted_by: null,
    });

    await expect(registerUseCase.execute(input)).rejects.toThrow(AppError);
    await expect(registerUseCase.execute(input)).rejects.toMatchObject({
      statusCode: 409,
      message: 'Email already in use',
    });
    expect(mockHashProvider.hash).not.toHaveBeenCalled();
    expect(mockUserRepository.create).not.toHaveBeenCalled();
  });
});


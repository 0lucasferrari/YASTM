import supertest from 'supertest';
import express from 'express';
import { AuthController } from '../../src/presentation/controllers/AuthController';
import { authRoutes } from '../../src/presentation/routes/authRoutes';
import { errorHandler } from '../../src/presentation/middlewares/errorHandler';
import { RegisterUseCase } from '../../src/application/use-cases/auth/RegisterUseCase';
import { LoginUseCase } from '../../src/application/use-cases/auth/LoginUseCase';
import { IUserRepository } from '../../src/domain/repositories/IUserRepository';
import { IHashProvider } from '../../src/domain/providers/IHashProvider';
import { ITokenProvider } from '../../src/domain/providers/ITokenProvider';
import { AppError } from '../../src/domain/errors/AppError';

describe('Auth Routes', () => {
  let app: express.Express;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockHashProvider: jest.Mocked<IHashProvider>;
  let mockTokenProvider: jest.Mocked<ITokenProvider>;

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

    const registerUseCase = new RegisterUseCase(mockUserRepository, mockHashProvider);
    const loginUseCase = new LoginUseCase(mockUserRepository, mockHashProvider, mockTokenProvider);
    const authController = new AuthController(registerUseCase, loginUseCase);

    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes(authController));
    app.use(errorHandler);
  });

  describe('POST /api/auth/register', () => {
    it('should register a user and return 201', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockHashProvider.hash.mockResolvedValue('hashed_password');
      mockUserRepository.create.mockResolvedValue({
        id: 'uuid-123',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashed_password',
        team_id: null,
        created_at: new Date('2026-01-01'),
        created_by: null,
        updated_at: new Date('2026-01-01'),
        updated_by: null,
        deleted_at: null,
        deleted_by: null,
      });

      const response = await supertest(app)
        .post('/api/auth/register')
        .send({ name: 'John Doe', email: 'john@example.com', password: 'password123' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.email).toBe('john@example.com');
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('should return 400 for invalid body', async () => {
      const response = await supertest(app)
        .post('/api/auth/register')
        .send({ name: '', email: 'not-an-email', password: '12' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 409 for duplicate email', async () => {
      mockUserRepository.findByEmail.mockResolvedValue({
        id: 'existing',
        name: 'Existing',
        email: 'john@example.com',
        password: 'hashed',
        team_id: null,
        created_at: new Date(),
        created_by: null,
        updated_at: new Date(),
        updated_by: null,
        deleted_at: null,
        deleted_by: null,
      });

      const response = await supertest(app)
        .post('/api/auth/register')
        .send({ name: 'John', email: 'john@example.com', password: 'password123' });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Email already in use');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login and return a token', async () => {
      mockUserRepository.findByEmail.mockResolvedValue({
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
      });
      mockHashProvider.compare.mockResolvedValue(true);
      mockTokenProvider.generate.mockReturnValue('jwt-token');

      const response = await supertest(app)
        .post('/api/auth/login')
        .send({ email: 'john@example.com', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBe('jwt-token');
      expect(response.body.data.user.email).toBe('john@example.com');
    });

    it('should return 401 for invalid credentials', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      const response = await supertest(app)
        .post('/api/auth/login')
        .send({ email: 'unknown@example.com', password: 'password123' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});


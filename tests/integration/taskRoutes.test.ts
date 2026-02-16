import supertest from 'supertest';
import express from 'express';
import { TaskController } from '../../src/presentation/controllers/TaskController';
import { taskRoutes } from '../../src/presentation/routes/taskRoutes';
import { authMiddleware } from '../../src/presentation/middlewares/authMiddleware';
import { errorHandler } from '../../src/presentation/middlewares/errorHandler';
import { CreateTaskUseCase } from '../../src/application/use-cases/task/CreateTaskUseCase';
import { ListTasksUseCase } from '../../src/application/use-cases/task/ListTasksUseCase';
import { GetTaskUseCase } from '../../src/application/use-cases/task/GetTaskUseCase';
import { UpdateTaskUseCase } from '../../src/application/use-cases/task/UpdateTaskUseCase';
import { DeleteTaskUseCase } from '../../src/application/use-cases/task/DeleteTaskUseCase';
import { AddAssigneeUseCase } from '../../src/application/use-cases/task/AddAssigneeUseCase';
import { RemoveAssigneeUseCase } from '../../src/application/use-cases/task/RemoveAssigneeUseCase';
import { AddTaskStatusUseCase } from '../../src/application/use-cases/task/AddTaskStatusUseCase';
import { SetCurrentStatusUseCase } from '../../src/application/use-cases/task/SetCurrentStatusUseCase';
import { AddTaskLabelUseCase } from '../../src/application/use-cases/task/AddTaskLabelUseCase';
import { RemoveTaskLabelUseCase } from '../../src/application/use-cases/task/RemoveTaskLabelUseCase';
import { CreateCommentUseCase } from '../../src/application/use-cases/comment/CreateCommentUseCase';
import { ITaskRepository } from '../../src/domain/repositories/ITaskRepository';
import { IUserRepository } from '../../src/domain/repositories/IUserRepository';
import { IStatusRepository } from '../../src/domain/repositories/IStatusRepository';
import { ILabelRepository } from '../../src/domain/repositories/ILabelRepository';
import { ICommentRepository } from '../../src/domain/repositories/ICommentRepository';
import { ITokenProvider } from '../../src/domain/providers/ITokenProvider';
import { Priority } from '../../src/domain/enums/Priority';

describe('Task Routes', () => {
  let app: express.Express;
  let mockTaskRepository: jest.Mocked<ITaskRepository>;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockStatusRepository: jest.Mocked<IStatusRepository>;
  let mockLabelRepository: jest.Mocked<ILabelRepository>;
  let mockCommentRepository: jest.Mocked<ICommentRepository>;
  let mockTokenProvider: jest.Mocked<ITokenProvider>;

  const authUserId = 'auth-user-uuid';
  const validToken = 'Bearer valid-token';

  beforeEach(() => {
    mockTaskRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      addAssignee: jest.fn(),
      removeAssignee: jest.fn(),
      getAssignees: jest.fn(),
      addStatus: jest.fn(),
      removeStatus: jest.fn(),
      getStatuses: jest.fn(),
      addLabel: jest.fn(),
      removeLabel: jest.fn(),
      getLabels: jest.fn(),
    };

    mockUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };

    mockStatusRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };

    mockLabelRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };

    mockCommentRepository = {
      findById: jest.fn(),
      findByTaskId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };

    mockTokenProvider = {
      generate: jest.fn(),
      verify: jest.fn().mockReturnValue({ sub: authUserId, email: 'user@test.com' }),
    };

    const taskController = new TaskController(
      new CreateTaskUseCase(mockTaskRepository, mockUserRepository),
      new ListTasksUseCase(mockTaskRepository),
      new GetTaskUseCase(mockTaskRepository),
      new UpdateTaskUseCase(mockTaskRepository),
      new DeleteTaskUseCase(mockTaskRepository),
      new AddAssigneeUseCase(mockTaskRepository, mockUserRepository),
      new RemoveAssigneeUseCase(mockTaskRepository),
      new AddTaskStatusUseCase(mockTaskRepository, mockStatusRepository),
      new SetCurrentStatusUseCase(mockTaskRepository),
      new AddTaskLabelUseCase(mockTaskRepository, mockLabelRepository),
      new RemoveTaskLabelUseCase(mockTaskRepository),
      new CreateCommentUseCase(mockCommentRepository, mockTaskRepository),
    );

    app = express();
    app.use(express.json());
    app.use('/api/tasks', authMiddleware(mockTokenProvider), taskRoutes(taskController));
    app.use(errorHandler);
  });

  describe('POST /api/tasks', () => {
    it('should create a task and return 201', async () => {
      mockUserRepository.findById.mockResolvedValue({
        id: authUserId,
        name: 'Auth User',
        email: 'user@test.com',
        password: 'hashed',
        team_id: null,
        created_at: new Date(),
        created_by: null,
        updated_at: new Date(),
        updated_by: null,
        deleted_at: null,
        deleted_by: null,
      });

      mockTaskRepository.create.mockResolvedValue({
        id: 'task-uuid',
        title: 'New Task',
        description: 'A description',
        parent_task_id: null,
        assignor_id: authUserId,
        current_status_id: null,
        priority: Priority.HIGH,
        created_at: new Date(),
        created_by: authUserId,
        updated_at: new Date(),
        updated_by: authUserId,
        deleted_at: null,
        deleted_by: null,
      });

      const response = await supertest(app)
        .post('/api/tasks')
        .set('Authorization', validToken)
        .send({ title: 'New Task', description: 'A description', priority: 'HIGH' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('New Task');
    });

    it('should return 401 without auth token', async () => {
      const response = await supertest(app)
        .post('/api/tasks')
        .send({ title: 'New Task' });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/tasks', () => {
    it('should list tasks and return 200', async () => {
      mockTaskRepository.findAll.mockResolvedValue([
        {
          id: 'task-1',
          title: 'Task 1',
          description: null,
          parent_task_id: null,
          assignor_id: authUserId,
          current_status_id: null,
          priority: null,
          created_at: new Date(),
          created_by: authUserId,
          updated_at: new Date(),
          updated_by: authUserId,
          deleted_at: null,
          deleted_by: null,
        },
      ]);

      const response = await supertest(app)
        .get('/api/tasks')
        .set('Authorization', validToken);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should return 404 for non-existent task', async () => {
      mockTaskRepository.findById.mockResolvedValue(null);

      const response = await supertest(app)
        .get('/api/tasks/550e8400-e29b-41d4-a716-446655440000')
        .set('Authorization', validToken);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});


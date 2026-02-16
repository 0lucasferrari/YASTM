import { CreateTaskUseCase } from '../../src/application/use-cases/task/CreateTaskUseCase';
import { ITaskRepository } from '../../src/domain/repositories/ITaskRepository';
import { IUserRepository } from '../../src/domain/repositories/IUserRepository';
import { AppError } from '../../src/domain/errors/AppError';
import { Priority } from '../../src/domain/enums/Priority';

describe('CreateTaskUseCase', () => {
  let createTaskUseCase: CreateTaskUseCase;
  let mockTaskRepository: jest.Mocked<ITaskRepository>;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  const mockUser = {
    id: 'user-uuid',
    name: 'John',
    email: 'john@example.com',
    password: 'hashed',
    team_id: null,
    created_at: new Date(),
    created_by: null,
    updated_at: new Date(),
    updated_by: null,
    deleted_at: null,
    deleted_by: null,
  };

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

    createTaskUseCase = new CreateTaskUseCase(mockTaskRepository, mockUserRepository);
  });

  it('should create a task successfully', async () => {
    const input = {
      title: 'New Task',
      description: 'Task description',
      priority: Priority.HIGH,
      assignor_id: 'user-uuid',
      created_by: 'user-uuid',
    };

    mockUserRepository.findById.mockResolvedValue(mockUser);
    mockTaskRepository.create.mockResolvedValue({
      id: 'task-uuid',
      title: input.title,
      description: input.description,
      parent_task_id: null,
      assignor_id: input.assignor_id,
      current_status_id: null,
      priority: input.priority,
      created_at: new Date(),
      created_by: input.created_by,
      updated_at: new Date(),
      updated_by: input.created_by,
      deleted_at: null,
      deleted_by: null,
    });

    const result = await createTaskUseCase.execute(input);

    expect(result).toHaveProperty('id');
    expect(result.title).toBe(input.title);
    expect(result.priority).toBe(Priority.HIGH);
    expect(result.assignor_id).toBe(input.assignor_id);
    expect(mockUserRepository.findById).toHaveBeenCalledWith(input.assignor_id);
  });

  it('should throw AppError when assignor is not found', async () => {
    const input = {
      title: 'New Task',
      assignor_id: 'nonexistent-uuid',
      created_by: 'nonexistent-uuid',
    };

    mockUserRepository.findById.mockResolvedValue(null);

    await expect(createTaskUseCase.execute(input)).rejects.toThrow(AppError);
    await expect(createTaskUseCase.execute(input)).rejects.toMatchObject({
      statusCode: 404,
      message: 'Assignor not found',
    });
    expect(mockTaskRepository.create).not.toHaveBeenCalled();
  });

  it('should throw AppError when parent task is not found', async () => {
    const input = {
      title: 'Sub Task',
      parent_task_id: 'nonexistent-parent',
      assignor_id: 'user-uuid',
      created_by: 'user-uuid',
    };

    mockUserRepository.findById.mockResolvedValue(mockUser);
    mockTaskRepository.findById.mockResolvedValue(null);

    await expect(createTaskUseCase.execute(input)).rejects.toThrow(AppError);
    await expect(createTaskUseCase.execute(input)).rejects.toMatchObject({
      statusCode: 404,
      message: 'Parent task not found',
    });
  });
});


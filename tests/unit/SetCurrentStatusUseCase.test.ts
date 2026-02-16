import { SetCurrentStatusUseCase } from '../../src/application/use-cases/task/SetCurrentStatusUseCase';
import { ITaskRepository } from '../../src/domain/repositories/ITaskRepository';
import { AppError } from '../../src/domain/errors/AppError';
import { Priority } from '../../src/domain/enums/Priority';

describe('SetCurrentStatusUseCase', () => {
  let setCurrentStatusUseCase: SetCurrentStatusUseCase;
  let mockTaskRepository: jest.Mocked<ITaskRepository>;

  const mockTask = {
    id: 'task-uuid',
    title: 'Test Task',
    description: null,
    parent_task_id: null,
    assignor_id: 'user-uuid',
    current_status_id: null,
    priority: Priority.MEDIUM,
    created_at: new Date(),
    created_by: 'user-uuid',
    updated_at: new Date(),
    updated_by: 'user-uuid',
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

    setCurrentStatusUseCase = new SetCurrentStatusUseCase(mockTaskRepository);
  });

  it('should set the current status when status is in possible statuses', async () => {
    const input = {
      task_id: 'task-uuid',
      status_id: 'status-uuid',
      updated_by: 'user-uuid',
    };

    mockTaskRepository.findById.mockResolvedValue(mockTask);
    mockTaskRepository.getStatuses.mockResolvedValue(['status-uuid', 'other-status']);
    mockTaskRepository.update.mockResolvedValue({
      ...mockTask,
      current_status_id: 'status-uuid',
    });

    const result = await setCurrentStatusUseCase.execute(input);

    expect(result.current_status_id).toBe('status-uuid');
    expect(mockTaskRepository.update).toHaveBeenCalledWith('task-uuid', {
      current_status_id: 'status-uuid',
      updated_by: 'user-uuid',
    });
  });

  it('should throw 400 when status is not in possible statuses', async () => {
    const input = {
      task_id: 'task-uuid',
      status_id: 'unknown-status',
      updated_by: 'user-uuid',
    };

    mockTaskRepository.findById.mockResolvedValue(mockTask);
    mockTaskRepository.getStatuses.mockResolvedValue(['status-uuid']);

    await expect(setCurrentStatusUseCase.execute(input)).rejects.toThrow(AppError);
    await expect(setCurrentStatusUseCase.execute(input)).rejects.toMatchObject({
      statusCode: 400,
    });
    expect(mockTaskRepository.update).not.toHaveBeenCalled();
  });

  it('should throw 404 when task is not found', async () => {
    const input = {
      task_id: 'nonexistent',
      status_id: 'status-uuid',
      updated_by: 'user-uuid',
    };

    mockTaskRepository.findById.mockResolvedValue(null);

    await expect(setCurrentStatusUseCase.execute(input)).rejects.toThrow(AppError);
    await expect(setCurrentStatusUseCase.execute(input)).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});


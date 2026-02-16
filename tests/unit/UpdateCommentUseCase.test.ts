import { UpdateCommentUseCase } from '../../src/application/use-cases/comment/UpdateCommentUseCase';
import { ICommentRepository } from '../../src/domain/repositories/ICommentRepository';
import { AppError } from '../../src/domain/errors/AppError';

describe('UpdateCommentUseCase', () => {
  let updateCommentUseCase: UpdateCommentUseCase;
  let mockCommentRepository: jest.Mocked<ICommentRepository>;

  const mockComment = {
    id: 'comment-uuid',
    task_id: 'task-uuid',
    creator_id: 'creator-uuid',
    content: 'Original content',
    created_at: new Date(),
    created_by: 'creator-uuid',
    updated_at: new Date(),
    updated_by: 'creator-uuid',
    deleted_at: null,
    deleted_by: null,
  };

  beforeEach(() => {
    mockCommentRepository = {
      findById: jest.fn(),
      findByTaskId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };

    updateCommentUseCase = new UpdateCommentUseCase(mockCommentRepository);
  });

  it('should update a comment successfully when the creator updates it', async () => {
    const input = {
      id: 'comment-uuid',
      content: 'Updated content',
      updated_by: 'creator-uuid',
    };

    mockCommentRepository.findById.mockResolvedValue(mockComment);
    mockCommentRepository.update.mockResolvedValue({
      ...mockComment,
      content: input.content,
      updated_at: new Date(),
    });

    const result = await updateCommentUseCase.execute(input);

    expect(result.content).toBe('Updated content');
    expect(mockCommentRepository.update).toHaveBeenCalledWith('comment-uuid', {
      content: 'Updated content',
      updated_by: 'creator-uuid',
    });
  });

  it('should throw 403 when a non-creator tries to update', async () => {
    const input = {
      id: 'comment-uuid',
      content: 'Updated content',
      updated_by: 'another-user-uuid',
    };

    mockCommentRepository.findById.mockResolvedValue(mockComment);

    await expect(updateCommentUseCase.execute(input)).rejects.toThrow(AppError);
    await expect(updateCommentUseCase.execute(input)).rejects.toMatchObject({
      statusCode: 403,
    });
    expect(mockCommentRepository.update).not.toHaveBeenCalled();
  });

  it('should throw 404 when comment is not found', async () => {
    const input = {
      id: 'nonexistent',
      content: 'Updated content',
      updated_by: 'creator-uuid',
    };

    mockCommentRepository.findById.mockResolvedValue(null);

    await expect(updateCommentUseCase.execute(input)).rejects.toThrow(AppError);
    await expect(updateCommentUseCase.execute(input)).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});


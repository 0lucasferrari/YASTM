import { IUseCase } from '../../interfaces/IUseCase';
import { CommentOutputDTO } from '../../dtos/comment/CommentDTO';
import { ICommentRepository } from '../../../domain/repositories/ICommentRepository';
import { ITaskRepository } from '../../../domain/repositories/ITaskRepository';
import { AppError } from '../../../domain/errors/AppError';

export class ListCommentsByTaskUseCase implements IUseCase<string, CommentOutputDTO[]> {
  constructor(
    private readonly commentRepository: ICommentRepository,
    private readonly taskRepository: ITaskRepository,
  ) {}

  async execute(taskId: string): Promise<CommentOutputDTO[]> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    const comments = await this.commentRepository.findByTaskId(taskId);
    return comments.map((comment) => ({
      id: comment.id,
      task_id: comment.task_id,
      creator_id: comment.creator_id,
      content: comment.content,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
    }));
  }
}


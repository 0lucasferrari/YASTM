import { v4 as uuidv4 } from 'uuid';
import { IUseCase } from '../../interfaces/IUseCase';
import { CreateCommentInputDTO, CommentOutputDTO } from '../../dtos/comment/CommentDTO';
import { ICommentRepository } from '../../../domain/repositories/ICommentRepository';
import { ITaskRepository } from '../../../domain/repositories/ITaskRepository';
import { AppError } from '../../../domain/errors/AppError';

export class CreateCommentUseCase implements IUseCase<CreateCommentInputDTO, CommentOutputDTO> {
  constructor(
    private readonly commentRepository: ICommentRepository,
    private readonly taskRepository: ITaskRepository,
  ) {}

  async execute(input: CreateCommentInputDTO): Promise<CommentOutputDTO> {
    const task = await this.taskRepository.findById(input.task_id);
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    const comment = await this.commentRepository.create({
      id: uuidv4(),
      task_id: input.task_id,
      creator_id: input.creator_id,
      content: input.content,
      created_by: input.created_by,
      updated_by: input.created_by,
    });

    return {
      id: comment.id,
      task_id: comment.task_id,
      creator_id: comment.creator_id,
      content: comment.content,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
    };
  }
}


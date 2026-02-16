import { IUseCase } from '../../interfaces/IUseCase';
import { CommentOutputDTO } from '../../dtos/comment/CommentDTO';
import { ICommentRepository } from '../../../domain/repositories/ICommentRepository';
import { AppError } from '../../../domain/errors/AppError';

export class GetCommentUseCase implements IUseCase<string, CommentOutputDTO> {
  constructor(private readonly commentRepository: ICommentRepository) {}

  async execute(id: string): Promise<CommentOutputDTO> {
    const comment = await this.commentRepository.findById(id);
    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

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


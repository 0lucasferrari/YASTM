import { IUseCase } from '../../interfaces/IUseCase';
import { UpdateCommentInputDTO, CommentOutputDTO } from '../../dtos/comment/CommentDTO';
import { ICommentRepository } from '../../../domain/repositories/ICommentRepository';
import { AppError } from '../../../domain/errors/AppError';

export class UpdateCommentUseCase implements IUseCase<UpdateCommentInputDTO, CommentOutputDTO> {
  constructor(private readonly commentRepository: ICommentRepository) {}

  async execute(input: UpdateCommentInputDTO): Promise<CommentOutputDTO> {
    const existing = await this.commentRepository.findById(input.id);
    if (!existing) {
      throw new AppError('Comment not found', 404);
    }

    if (existing.creator_id !== input.updated_by) {
      throw new AppError('Only the comment creator can update this comment', 403);
    }

    const updated = await this.commentRepository.update(input.id, {
      content: input.content,
      updated_by: input.updated_by,
    });

    if (!updated) {
      throw new AppError('Failed to update comment', 500);
    }

    return {
      id: updated.id,
      task_id: updated.task_id,
      creator_id: updated.creator_id,
      content: updated.content,
      created_at: updated.created_at,
      updated_at: updated.updated_at,
    };
  }
}


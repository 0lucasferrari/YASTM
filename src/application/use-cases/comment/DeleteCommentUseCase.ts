import { IUseCase } from '../../interfaces/IUseCase';
import { ICommentRepository } from '../../../domain/repositories/ICommentRepository';
import { AppError } from '../../../domain/errors/AppError';

interface DeleteCommentInputDTO {
  id: string;
  deleted_by: string;
}

export class DeleteCommentUseCase implements IUseCase<DeleteCommentInputDTO, void> {
  constructor(private readonly commentRepository: ICommentRepository) {}

  async execute(input: DeleteCommentInputDTO): Promise<void> {
    const comment = await this.commentRepository.findById(input.id);
    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    if (comment.creator_id !== input.deleted_by) {
      throw new AppError('Only the comment creator can delete this comment', 403);
    }

    await this.commentRepository.softDelete(input.id, input.deleted_by);
  }
}


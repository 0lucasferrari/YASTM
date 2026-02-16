import { Request, Response, NextFunction } from 'express';
import { GetCommentUseCase } from '../../application/use-cases/comment/GetCommentUseCase';
import { UpdateCommentUseCase } from '../../application/use-cases/comment/UpdateCommentUseCase';
import { DeleteCommentUseCase } from '../../application/use-cases/comment/DeleteCommentUseCase';
import { param } from '../helpers/params';

export class CommentController {
  constructor(
    private readonly getCommentUseCase: GetCommentUseCase,
    private readonly updateCommentUseCase: UpdateCommentUseCase,
    private readonly deleteCommentUseCase: DeleteCommentUseCase,
  ) {}

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.getCommentUseCase.execute(param(req.params.id));
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.updateCommentUseCase.execute({
        id: param(req.params.id),
        content: req.body.content,
        updated_by: req.user!.id,
      });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.deleteCommentUseCase.execute({
        id: param(req.params.id),
        deleted_by: req.user!.id,
      });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

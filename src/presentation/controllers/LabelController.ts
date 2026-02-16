import { Request, Response, NextFunction } from 'express';
import { CreateLabelUseCase } from '../../application/use-cases/label/CreateLabelUseCase';
import { ListLabelsUseCase } from '../../application/use-cases/label/ListLabelsUseCase';
import { GetLabelUseCase } from '../../application/use-cases/label/GetLabelUseCase';
import { UpdateLabelUseCase } from '../../application/use-cases/label/UpdateLabelUseCase';
import { DeleteLabelUseCase } from '../../application/use-cases/label/DeleteLabelUseCase';
import { param } from '../helpers/params';

export class LabelController {
  constructor(
    private readonly createLabelUseCase: CreateLabelUseCase,
    private readonly listLabelsUseCase: ListLabelsUseCase,
    private readonly getLabelUseCase: GetLabelUseCase,
    private readonly updateLabelUseCase: UpdateLabelUseCase,
    private readonly deleteLabelUseCase: DeleteLabelUseCase,
  ) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.createLabelUseCase.execute({
        ...req.body,
        created_by: req.user!.id,
      });
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.listLabelsUseCase.execute();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.getLabelUseCase.execute(param(req.params.id));
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.updateLabelUseCase.execute({
        id: param(req.params.id),
        ...req.body,
        updated_by: req.user!.id,
      });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.deleteLabelUseCase.execute({
        id: param(req.params.id),
        deleted_by: req.user!.id,
      });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

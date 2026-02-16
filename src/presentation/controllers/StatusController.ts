import { Request, Response, NextFunction } from 'express';
import { CreateStatusUseCase } from '../../application/use-cases/status/CreateStatusUseCase';
import { ListStatusesUseCase } from '../../application/use-cases/status/ListStatusesUseCase';
import { GetStatusUseCase } from '../../application/use-cases/status/GetStatusUseCase';
import { UpdateStatusUseCase } from '../../application/use-cases/status/UpdateStatusUseCase';
import { DeleteStatusUseCase } from '../../application/use-cases/status/DeleteStatusUseCase';
import { param } from '../helpers/params';

export class StatusController {
  constructor(
    private readonly createStatusUseCase: CreateStatusUseCase,
    private readonly listStatusesUseCase: ListStatusesUseCase,
    private readonly getStatusUseCase: GetStatusUseCase,
    private readonly updateStatusUseCase: UpdateStatusUseCase,
    private readonly deleteStatusUseCase: DeleteStatusUseCase,
  ) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.createStatusUseCase.execute({
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
      const result = await this.listStatusesUseCase.execute();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.getStatusUseCase.execute(param(req.params.id));
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.updateStatusUseCase.execute({
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
      await this.deleteStatusUseCase.execute({
        id: param(req.params.id),
        deleted_by: req.user!.id,
      });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

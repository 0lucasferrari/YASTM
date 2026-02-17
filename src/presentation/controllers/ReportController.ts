import { Request, Response, NextFunction } from 'express';
import { GetTaskReportUseCase } from '../../application/use-cases/report/GetTaskReportUseCase';
import { param } from '../helpers/params';

export class ReportController {
  constructor(
    private readonly getTaskReportUseCase: GetTaskReportUseCase,
  ) {}

  getTaskReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.getTaskReportUseCase.execute(param(req.params.id));
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}


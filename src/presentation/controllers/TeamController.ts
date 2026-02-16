import { Request, Response, NextFunction } from 'express';
import { CreateTeamUseCase } from '../../application/use-cases/team/CreateTeamUseCase';
import { ListTeamsUseCase } from '../../application/use-cases/team/ListTeamsUseCase';
import { GetTeamUseCase } from '../../application/use-cases/team/GetTeamUseCase';
import { UpdateTeamUseCase } from '../../application/use-cases/team/UpdateTeamUseCase';
import { DeleteTeamUseCase } from '../../application/use-cases/team/DeleteTeamUseCase';
import { param } from '../helpers/params';

export class TeamController {
  constructor(
    private readonly createTeamUseCase: CreateTeamUseCase,
    private readonly listTeamsUseCase: ListTeamsUseCase,
    private readonly getTeamUseCase: GetTeamUseCase,
    private readonly updateTeamUseCase: UpdateTeamUseCase,
    private readonly deleteTeamUseCase: DeleteTeamUseCase,
  ) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.createTeamUseCase.execute({
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
      const result = await this.listTeamsUseCase.execute();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.getTeamUseCase.execute(param(req.params.id));
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.updateTeamUseCase.execute({
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
      await this.deleteTeamUseCase.execute({
        id: param(req.params.id),
        deleted_by: req.user!.id,
      });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

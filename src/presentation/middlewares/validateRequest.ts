import { Request, Response, NextFunction } from 'express';
import { z } from 'zod/v4';

interface ValidationSchemas {
  body?: z.ZodType;
  params?: z.ZodType;
  query?: z.ZodType;
}

export function validateRequest(schemas: ValidationSchemas) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Validation failed on request params',
            statusCode: 400,
            details: result.error.issues,
          },
        });
        return;
      }
      Object.assign(req.params, result.data);
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Validation failed on request query',
            statusCode: 400,
            details: result.error.issues,
          },
        });
        return;
      }
    }

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Validation failed on request body',
            statusCode: 400,
            details: result.error.issues,
          },
        });
        return;
      }
      req.body = result.data;
    }

    next();
  };
}

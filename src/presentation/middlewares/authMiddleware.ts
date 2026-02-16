import { Request, Response, NextFunction } from 'express';
import { ITokenProvider } from '../../domain/providers/ITokenProvider';
import { AppError } from '../../domain/errors/AppError';

export function authMiddleware(tokenProvider: ITokenProvider) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError('Missing authorization header', 401);
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new AppError('Invalid authorization format. Expected: Bearer <token>', 401);
    }

    const token = authHeader.substring(7);

    try {
      const payload = tokenProvider.verify(token);
      req.user = {
        id: payload.sub,
        email: payload.email,
      };
      next();
    } catch {
      throw new AppError('Invalid or expired token', 401);
    }
  };
}


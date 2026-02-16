import jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { ITokenProvider, TokenPayload } from '../../domain/providers/ITokenProvider';
import { env } from '../../shared/config/env';

export class JwtTokenProvider implements ITokenProvider {
  generate(payload: TokenPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as StringValue,
    });
  }

  verify(token: string): TokenPayload {
    const decoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;
    return {
      sub: decoded.sub as string,
      email: decoded.email as string,
    };
  }
}


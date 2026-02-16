import bcrypt from 'bcrypt';
import { IHashProvider } from '../../domain/providers/IHashProvider';
import { env } from '../../shared/config/env';

export class BcryptHashProvider implements IHashProvider {
  async hash(plainText: string): Promise<string> {
    return bcrypt.hash(plainText, env.BCRYPT_SALT_ROUNDS);
  }

  async compare(plainText: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plainText, hashed);
  }
}


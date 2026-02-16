export interface IHashProvider {
  hash(plainText: string): Promise<string>;
  compare(plainText: string, hashed: string): Promise<boolean>;
}


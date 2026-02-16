export interface TokenPayload {
  sub: string;
  email: string;
}

export interface ITokenProvider {
  generate(payload: TokenPayload): string;
  verify(token: string): TokenPayload;
}


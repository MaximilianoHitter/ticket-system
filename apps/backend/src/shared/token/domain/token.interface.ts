export const TOKEN_SERVICE = Symbol('TOKEN_SERVICE');

export interface TokenPayload {
  userId: string;
  role: string;
}

export interface TokenServiceInterface {
  generate(payload: TokenPayload): string;
}

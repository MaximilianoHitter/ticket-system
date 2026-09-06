import { Role } from '@ticketapp/shared-types';

export const TOKEN_SERVICE = Symbol('TOKEN_SERVICE');

export interface TokenPayload {
  userId: string;
  role: Role;
}

export interface TokenServiceInterface {
  generate(payload: TokenPayload): string;
}

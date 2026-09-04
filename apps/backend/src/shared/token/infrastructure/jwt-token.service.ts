import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload, TokenServiceInterface } from '../domain/token.interface';

@Injectable()
export class JwtTokenService implements TokenServiceInterface {
  constructor(private readonly jwtService: JwtService) {}

  generate(payload: TokenPayload): string {
    return this.jwtService.sign(payload);
  }
}

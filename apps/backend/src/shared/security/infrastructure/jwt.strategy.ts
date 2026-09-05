import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenPayload } from 'src/shared/token/domain/token.interface';

const jwtSecret = process.env.JWT_SECRET as string;

if (!jwtSecret) {
  throw new Error('JWT_SECRET no cargada en el ambiente');
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: TokenPayload): Promise<TokenPayload> {
    return payload;
  }
}

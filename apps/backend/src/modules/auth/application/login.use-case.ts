import { Inject, Injectable } from '@nestjs/common';
import { User } from 'src/modules/users/domain/entities/user.entity';
import {
  USER_REPOSITORY,
  UserRepositoryInterface,
} from 'src/modules/users/domain/interfaces/user-repository.interface';
import {
  HASHING_SERVICE,
  HashingServiceInterface,
} from 'src/shared/hashing/domain/hashing.interface';
import { TOKEN_SERVICE, TokenServiceInterface } from 'src/shared/token/domain/token.interface';
import { InvalidCredentialsError } from '../domain/exceptions/invalid-credentials.error';
import { LOGGER_SERVICE, LoggerServiceInterface } from 'src/shared/logger/domain/logger.interface';

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginOutput {
  token: string;
  user: User;
}

@Injectable()
export class LoginUseCase {
  private readonly ctx: string = LoginUseCase.name;
  constructor(
    @Inject(LOGGER_SERVICE)
    private readonly loggerService: LoggerServiceInterface,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(HASHING_SERVICE)
    private readonly hashingService: HashingServiceInterface,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenServiceInterface,
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    try {
      const user = await this.userRepository.findByEmail(input.email);
      if (!user) throw new InvalidCredentialsError();

      const isPasswordValid = await this.hashingService.compare(
        input.password,
        user.getPasswordHash(),
      );

      if (!isPasswordValid) throw new InvalidCredentialsError();

      const token: LoginOutput = {
        token: this.tokenService.generate({ userId: user.getId(), role: user.getRole() }),
        user: user,
      };

      return token;
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        throw error;
      }

      this.loggerService.error(
        'Unexpected error during login',
        error instanceof Error ? error.stack : String(error),
        this.ctx,
      );
      throw new Error('Ha ocurrido un error inesperado.');
    }
  }
}

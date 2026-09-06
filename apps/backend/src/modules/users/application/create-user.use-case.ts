import { Role } from '@ticketapp/shared-types';
import { User } from '../domain/entities/user.entity';
import { Inject, Injectable } from '@nestjs/common';
import {
  USER_REPOSITORY,
  UserRepositoryInterface,
} from '../domain/interfaces/user-repository.interface';
import { HASHING_SERVICE, HashingServiceInterface } from '@shared/hashing/domain/hashing.interface';
import { LOGGER_SERVICE, LoggerServiceInterface } from '@shared/logger/domain/logger.interface';
import { UserAlreadyExistsError } from '../domain/exceptions/user-already-exists.error';
import { randomUUID } from 'crypto';

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  role: Role;
}

export interface CreateUserOutput {
  user: User;
}

@Injectable()
export class CreateUserUseCase {
  private readonly ctx = CreateUserUseCase.name;

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(HASHING_SERVICE)
    private readonly hashingService: HashingServiceInterface,
    @Inject(LOGGER_SERVICE)
    private readonly logger: LoggerServiceInterface,
  ) {}

  async execute(input: CreateUserInput): Promise<CreateUserOutput> {
    try {
      const existingUser = await this.userRepository.findByEmail(input.email);
      if (existingUser) throw new UserAlreadyExistsError();

      const passwordHash = await this.hashingService.hash(input.password);

      const newUser = new User(randomUUID(), input.email, passwordHash, input.name, input.role);

      const savedUser = await this.userRepository.save(newUser);

      return { user: savedUser };
    } catch (error) {
      if (error instanceof UserAlreadyExistsError) {
        throw error;
      }

      this.logger.error(
        'Ha ocurrido un error al crear el usuario',
        error instanceof Error ? error.stack : String(error),
        this.ctx,
      );
      throw new Error('Ha ocurrido un error inesperado.');
    }
  }
}

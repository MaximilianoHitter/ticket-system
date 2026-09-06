import { Test, TestingModule } from '@nestjs/testing';
import { HASHING_SERVICE, HashingServiceInterface } from '@shared/hashing/domain/hashing.interface';
import { TOKEN_SERVICE, TokenServiceInterface } from '@shared/token/domain/token.interface';
import { LOGGER_SERVICE, LoggerServiceInterface } from '@shared/logger/domain/logger.interface';

import { Role } from '@ticketapp/shared-types';
import { LoginUseCase } from '@modules/auth/application/login.use-case';
import {
  USER_REPOSITORY,
  UserRepositoryInterface,
} from '@modules/users/domain/interfaces/user-repository.interface';
import { InvalidCredentialsError } from '@modules/auth/domain/exceptions/invalid-credentials.error';
import { User } from '@modules/users/domain/entities/user.entity';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let userRepository: jest.Mocked<UserRepositoryInterface>;
  let hashingService: jest.Mocked<HashingServiceInterface>;
  let tokenService: jest.Mocked<TokenServiceInterface>;
  let logger: jest.Mocked<LoggerServiceInterface>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        {
          provide: USER_REPOSITORY,
          useValue: { findByEmail: jest.fn(), findById: jest.fn() },
        },
        {
          provide: HASHING_SERVICE,
          useValue: { hash: jest.fn(), compare: jest.fn() },
        },
        {
          provide: TOKEN_SERVICE,
          useValue: { generate: jest.fn() },
        },
        {
          provide: LOGGER_SERVICE,
          useValue: { log: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get(LoginUseCase);
    userRepository = module.get(USER_REPOSITORY);
    hashingService = module.get(HASHING_SERVICE);
    tokenService = module.get(TOKEN_SERVICE);
    logger = module.get(LOGGER_SERVICE);
  });

  it('debería lanzar InvalidCredentialsError si el usuario no existe', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({ email: 'noexiste@test.com', password: '123456' }),
    ).rejects.toThrow(InvalidCredentialsError);
  });

  it('debería lanzar InvalidCredentialsError si la contraseña no coincide', async () => {
    const fakeUser = new User('id-1', 'user@test.com', 'hashed-pass', Role.CLIENTE);
    userRepository.findByEmail.mockResolvedValue(fakeUser);
    hashingService.compare.mockResolvedValue(false);

    await expect(
      useCase.execute({ email: 'user@test.com', password: 'wrong-password' }),
    ).rejects.toThrow(InvalidCredentialsError);
  });

  it('debería devolver token y usuario si las credenciales son correctas', async () => {
    const fakeUser = new User('id-1', 'user@test.com', 'hashed-pass', Role.CLIENTE);
    userRepository.findByEmail.mockResolvedValue(fakeUser);
    hashingService.compare.mockResolvedValue(true);
    tokenService.generate.mockReturnValue('fake-jwt-token');

    const result = await useCase.execute({ email: 'user@test.com', password: 'correct-password' });

    expect(result.token).toBe('fake-jwt-token');
    expect(result.user).toBe(fakeUser);
    expect(tokenService.generate).toHaveBeenCalledWith({
      userId: 'id-1',
      role: Role.CLIENTE,
    });
  });

  it('debería loguear y relanzar un error genérico ante una falla inesperada', async () => {
    userRepository.findByEmail.mockRejectedValue(new Error('DB connection lost'));

    await expect(useCase.execute({ email: 'user@test.com', password: '123456' })).rejects.toThrow(
      'Ha ocurrido un error inesperado.',
    );

    expect(logger.error).toHaveBeenCalled();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserUseCase } from '@modules/users/application/create-user.use-case';
import {
  USER_REPOSITORY,
  UserRepositoryInterface,
} from '@modules/users/domain/interfaces/user-repository.interface';
import { HASHING_SERVICE, HashingServiceInterface } from '@shared/hashing/domain/hashing.interface';
import { LOGGER_SERVICE, LoggerServiceInterface } from '@shared/logger/domain/logger.interface';
import { UserAlreadyExistsError } from '@modules/users/domain/exceptions/user-already-exists.error';
import { User } from '@modules/users/domain/entities/user.entity';
import { Role } from '@ticketapp/shared-types';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let userRepository: jest.Mocked<UserRepositoryInterface>;
  let hashingService: jest.Mocked<HashingServiceInterface>;
  let logger: jest.Mocked<LoggerServiceInterface>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserUseCase,
        {
          provide: USER_REPOSITORY,
          useValue: { findByEmail: jest.fn(), findById: jest.fn(), save: jest.fn() },
        },
        {
          provide: HASHING_SERVICE,
          useValue: { hash: jest.fn(), compare: jest.fn() },
        },
        {
          provide: LOGGER_SERVICE,
          useValue: { log: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get(CreateUserUseCase);
    userRepository = module.get(USER_REPOSITORY);
    hashingService = module.get(HASHING_SERVICE);
    logger = module.get(LOGGER_SERVICE);
  });

  it('debería crear el usuario correctamente si el email no existe', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    hashingService.hash.mockResolvedValue('hashed-password');

    const savedUser = new User(
      'generated-id',
      'new@test.com',
      'hashed-password',
      'New User',
      Role.CLIENTE,
    );
    userRepository.save.mockResolvedValue(savedUser);

    const result = await useCase.execute({
      email: 'new@test.com',
      password: 'plain-password',
      name: 'New User',
      role: Role.CLIENTE,
    });

    expect(result.user).toBe(savedUser);
    expect(hashingService.hash).toHaveBeenCalledWith('plain-password');
    expect(userRepository.save).toHaveBeenCalled();
  });

  it('debería guardar el usuario con la contraseña hasheada, no en texto plano', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    hashingService.hash.mockResolvedValue('hashed-password');
    userRepository.save.mockImplementation(async (user) => user);

    await useCase.execute({
      email: 'new@test.com',
      password: 'plain-password',
      name: 'New User',
      role: Role.CLIENTE,
    });

    const savedUserArg = userRepository.save.mock.calls[0][0];
    expect(savedUserArg.getPassword()).toBe('hashed-password');
  });

  it('debería lanzar UserAlreadyExistsError si el email ya existe', async () => {
    const existingUser = new User(
      'id-1',
      'existing@test.com',
      'hash',
      'Existing User',
      Role.CLIENTE,
    );
    userRepository.findByEmail.mockResolvedValue(existingUser);

    await expect(
      useCase.execute({
        email: 'existing@test.com',
        password: 'plain-password',
        name: 'New User',
        role: Role.CLIENTE,
      }),
    ).rejects.toThrow(UserAlreadyExistsError);

    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('debería loguear y relanzar un error genérico ante una falla inesperada', async () => {
    userRepository.findByEmail.mockRejectedValue(new Error('DB connection lost'));

    await expect(
      useCase.execute({
        email: 'new@test.com',
        password: 'plain-password',
        name: 'New User',
        role: Role.CLIENTE,
      }),
    ).rejects.toThrow('Ha ocurrido un error inesperado.');

    expect(logger.error).toHaveBeenCalled();
  });
});

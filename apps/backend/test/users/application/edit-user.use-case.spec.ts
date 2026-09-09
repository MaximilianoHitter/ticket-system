import { Test, TestingModule } from '@nestjs/testing';
import { EditUserUseCase } from '@modules/users/application/edit-user.use-case';
import {
  USER_REPOSITORY,
  UserRepositoryInterface,
} from '@modules/users/domain/interfaces/user-repository.interface';
import { HASHING_SERVICE, HashingServiceInterface } from '@shared/hashing/domain/hashing.interface';
import { UserNotFoundError } from '@modules/users/domain/exceptions/user-not-found.error';
import { User } from '@modules/users/domain/entities/user.entity';
import { Role } from '@ticketapp/shared-types';
import { ForbiddenActionError } from '@shared/domain/exceptions/forbidden-action-error';

describe('EditUserUseCase', () => {
  let useCase: EditUserUseCase;
  let userRepository: jest.Mocked<UserRepositoryInterface>;
  let hashingService: jest.Mocked<HashingServiceInterface>;

  const existingUser = new User('user-1', 'user@test.com', 'old-hash', 'Old Name', Role.CLIENTE);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EditUserUseCase,
        {
          provide: USER_REPOSITORY,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            findAll: jest.fn(),
          },
        },
        {
          provide: HASHING_SERVICE,
          useValue: { hash: jest.fn(), compare: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get(EditUserUseCase);
    userRepository = module.get(USER_REPOSITORY);
    hashingService = module.get(HASHING_SERVICE);
  });

  it('debería permitir a un Admin editar name, password y role de otro usuario', async () => {
    userRepository.findById.mockResolvedValue(existingUser);
    hashingService.hash.mockResolvedValue('new-hash');
    userRepository.update.mockImplementation(
      async (id, data) =>
        new User(id, existingUser.getEmail(), data.passwordHash, data.name, data.role),
    );

    const result = await useCase.execute({
      targetUserId: 'user-1',
      requestingUser: { userId: 'admin-1', role: Role.ADMIN },
      name: 'New Name',
      password: 'new-password',
      role: Role.GESTOR,
    });

    expect(userRepository.update).toHaveBeenCalledWith('user-1', {
      name: 'New Name',
      passwordHash: 'new-hash',
      role: Role.GESTOR,
    });
    expect(result.user.getRole()).toBe(Role.GESTOR);
  });

  it('debería permitir al propio usuario editar su name y password', async () => {
    userRepository.findById.mockResolvedValue(existingUser);
    hashingService.hash.mockResolvedValue('new-hash');
    userRepository.update.mockImplementation(
      async (id, data) =>
        new User(id, existingUser.getEmail(), data.passwordHash, data.name, data.role),
    );

    const result = await useCase.execute({
      targetUserId: 'user-1',
      requestingUser: { userId: 'user-1', role: Role.CLIENTE },
      name: 'New Name',
      password: 'new-password',
    });

    expect(userRepository.update).toHaveBeenCalledWith('user-1', {
      name: 'New Name',
      passwordHash: 'new-hash',
      role: Role.CLIENTE, // se mantiene el rol original
    });
    expect(result.user.getName()).toBe('New Name');
  });

  it('debería lanzar ForbiddenActionError si el propio usuario intenta cambiar su role', async () => {
    userRepository.findById.mockResolvedValue(existingUser);

    await expect(
      useCase.execute({
        targetUserId: 'user-1',
        requestingUser: { userId: 'user-1', role: Role.CLIENTE },
        role: Role.ADMIN,
      }),
    ).rejects.toThrow(ForbiddenActionError);

    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it('debería lanzar ForbiddenActionError si un usuario intenta editar a otro sin ser Admin', async () => {
    userRepository.findById.mockResolvedValue(existingUser);

    await expect(
      useCase.execute({
        targetUserId: 'user-1',
        requestingUser: { userId: 'other-user', role: Role.CLIENTE },
        name: 'Hacked Name',
      }),
    ).rejects.toThrow(ForbiddenActionError);

    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it('debería lanzar UserNotFoundError si el usuario a editar no existe', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        targetUserId: 'no-existe',
        requestingUser: { userId: 'admin-1', role: Role.ADMIN },
        name: 'New Name',
      }),
    ).rejects.toThrow(UserNotFoundError);
  });

  it('debería conservar los valores originales si no se envían campos', async () => {
    userRepository.findById.mockResolvedValue(existingUser);
    userRepository.update.mockImplementation(
      async (id, data) =>
        new User(id, existingUser.getEmail(), data.passwordHash, data.name, data.role),
    );

    await useCase.execute({
      targetUserId: 'user-1',
      requestingUser: { userId: 'user-1', role: Role.CLIENTE },
    });

    expect(userRepository.update).toHaveBeenCalledWith('user-1', {
      name: existingUser.getName(),
      passwordHash: existingUser.getPassword(),
      role: existingUser.getRole(),
    });
    expect(hashingService.hash).not.toHaveBeenCalled();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { DeactivateUserUseCase } from '@modules/users/application/deactivate-user.use-case';
import {
  USER_REPOSITORY,
  UserRepositoryInterface,
} from '@modules/users/domain/interfaces/user-repository.interface';
import { UserNotFoundError } from '@modules/users/domain/exceptions/user-not-found.error';

import { User } from '@modules/users/domain/entities/user.entity';
import { Role } from '@ticketapp/shared-types';
import { ForbiddenActionError } from '@shared/domain/exceptions/forbidden-action-error';
import { UserAlreadyDeactivatedError } from '@modules/users/domain/exceptions/user-alterady-deactivated.error';

describe('DeactivateUserUseCase', () => {
  let useCase: DeactivateUserUseCase;
  let userRepository: jest.Mocked<UserRepositoryInterface>;

  const activeUser = new User(
    'user-1',
    'user@test.com',
    'hash',
    'Active User',
    Role.CLIENTE,
    null, // deletedAt null -> activo
  );

  const deactivatedUser = new User(
    'user-2',
    'deactivated@test.com',
    'hash',
    'Deactivated User',
    Role.CLIENTE,
    new Date(), // ya desactivado
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeactivateUserUseCase,
        {
          provide: USER_REPOSITORY,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            deactivate: jest.fn(),
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get(DeactivateUserUseCase);
    userRepository = module.get(USER_REPOSITORY);
  });

  it('debería desactivar correctamente a un usuario activo', async () => {
    userRepository.findById.mockResolvedValue(activeUser);
    userRepository.deactivate.mockResolvedValue(deactivatedUser);

    const result = await useCase.execute({
      targetUserId: 'user-1',
      requestingUser: { userId: 'admin-1', role: Role.ADMIN },
    });

    expect(userRepository.deactivate).toHaveBeenCalledWith('user-1');
    expect(result.user).toBe(deactivatedUser);
  });

  it('debería lanzar UserNotFoundError si el usuario no existe', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        targetUserId: 'no-existe',
        requestingUser: { userId: 'admin-1', role: Role.ADMIN },
      }),
    ).rejects.toThrow(UserNotFoundError);

    expect(userRepository.deactivate).not.toHaveBeenCalled();
  });

  it('debería lanzar ForbiddenActionError si el admin intenta autodesactivarse', async () => {
    userRepository.findById.mockResolvedValue(activeUser);

    await expect(
      useCase.execute({
        targetUserId: 'user-1',
        requestingUser: { userId: 'user-1', role: Role.ADMIN },
      }),
    ).rejects.toThrow(ForbiddenActionError);

    expect(userRepository.deactivate).not.toHaveBeenCalled();
  });

  it('debería lanzar UserAlreadyDeactivatedError si el usuario ya estaba desactivado', async () => {
    userRepository.findById.mockResolvedValue(deactivatedUser);

    await expect(
      useCase.execute({
        targetUserId: 'user-2',
        requestingUser: { userId: 'admin-1', role: Role.ADMIN },
      }),
    ).rejects.toThrow(UserAlreadyDeactivatedError);

    expect(userRepository.deactivate).not.toHaveBeenCalled();
  });
});

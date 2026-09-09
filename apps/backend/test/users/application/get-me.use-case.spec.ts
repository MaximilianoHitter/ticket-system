import { Test, TestingModule } from '@nestjs/testing';
import { GetMeUseCase } from '@modules/users/application/get-me.use-case';
import {
  USER_REPOSITORY,
  UserRepositoryInterface,
} from '@modules/users/domain/interfaces/user-repository.interface';
import { UserNotFoundError } from '@modules/users/domain/exceptions/user-not-found.error';
import { User } from '@modules/users/domain/entities/user.entity';
import { Role } from '@ticketapp/shared-types';

describe('GetMeUseCase', () => {
  let useCase: GetMeUseCase;
  let userRepository: jest.Mocked<UserRepositoryInterface>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetMeUseCase,
        {
          provide: USER_REPOSITORY,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            save: jest.fn(),
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get(GetMeUseCase);
    userRepository = module.get(USER_REPOSITORY);
  });

  it('debería devolver el usuario correspondiente al userId del token', async () => {
    const fakeUser = new User('id-1', 'user@test.com', 'hash', 'Test User', Role.CLIENTE);
    userRepository.findById.mockResolvedValue(fakeUser);

    const result = await useCase.execute({
      user: { userId: 'id-1', role: Role.CLIENTE },
    });

    expect(result.user).toBe(fakeUser);
    expect(userRepository.findById).toHaveBeenCalledWith('id-1');
  });

  it('debería lanzar UserNotFoundError si el usuario del token no existe', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ user: { userId: 'id-inexistente', role: Role.CLIENTE } }),
    ).rejects.toThrow(UserNotFoundError);
  });
});

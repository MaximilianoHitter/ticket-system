import { Test, TestingModule } from '@nestjs/testing';
import { ListUsersUseCase } from '@modules/users/application/list-users.use-case';
import {
  USER_REPOSITORY,
  UserRepositoryInterface,
} from '@modules/users/domain/interfaces/user-repository.interface';
import { User } from '@modules/users/domain/entities/user.entity';
import { Role } from '@ticketapp/shared-types';

describe('ListUsersUseCase', () => {
  let useCase: ListUsersUseCase;
  let userRepository: jest.Mocked<UserRepositoryInterface>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListUsersUseCase,
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

    useCase = module.get(ListUsersUseCase);
    userRepository = module.get(USER_REPOSITORY);
  });

  it('debería devolver la lista de usuarios y el total', async () => {
    const fakeUsers = [
      new User('id-1', 'user1@test.com', 'hash', 'User One', Role.CLIENTE),
      new User('id-2', 'user2@test.com', 'hash', 'User Two', Role.GESTOR),
    ];
    userRepository.findAll.mockResolvedValue({ users: fakeUsers, total: 2 });

    const result = await useCase.execute({ skip: 0, take: 10 });

    expect(result.users).toBe(fakeUsers);
    expect(result.total).toBe(2);
  });

  it('debería pasar el filtro de role al repositorio', async () => {
    userRepository.findAll.mockResolvedValue({ users: [], total: 0 });

    await useCase.execute({ skip: 0, take: 10, role: Role.ADMIN });

    expect(userRepository.findAll).toHaveBeenCalledWith(0, 10, Role.ADMIN, undefined);
  });

  it('debería pasar el filtro de email al repositorio', async () => {
    userRepository.findAll.mockResolvedValue({ users: [], total: 0 });

    await useCase.execute({ skip: 0, take: 10, email: 'juan' });

    expect(userRepository.findAll).toHaveBeenCalledWith(0, 10, undefined, 'juan');
  });

  it('debería devolver una lista vacía si no hay resultados', async () => {
    userRepository.findAll.mockResolvedValue({ users: [], total: 0 });

    const result = await useCase.execute({ skip: 0, take: 10 });

    expect(result.users).toEqual([]);
    expect(result.total).toBe(0);
  });
});

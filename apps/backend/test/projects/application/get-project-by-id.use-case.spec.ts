import { Test, TestingModule } from '@nestjs/testing';
import { GetProjectByIdUseCase } from '@modules/projects/application/get-project-by-id.use-case';
import {
  PROJECT_REPOSITORY,
  ProjectRepositoryInterface,
} from '@modules/projects/domain/interfaces/project-repository.interface';
import {
  USER_REPOSITORY,
  UserRepositoryInterface,
} from '@modules/users/domain/interfaces/user-repository.interface';
import { ProjectNotFoundError } from '@modules/projects/domain/exceptions/project-not-found.exception';
import { Project } from '@modules/projects/domain/entities/project.entity';
import { User } from '@modules/users/domain/entities/user.entity';
import { Role } from '@ticketapp/shared-types';

describe('GetProjectByIdUseCase', () => {
  let useCase: GetProjectByIdUseCase;
  let projectRepository: jest.Mocked<ProjectRepositoryInterface>;
  let userRepository: jest.Mocked<UserRepositoryInterface>;

  const existingProject = new Project('project-1', 'Test Project', null, 'creator-1');
  const creatorUser = new User('creator-1', 'creator@test.com', 'hash', 'Creator', Role.ADMIN);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProjectByIdUseCase,
        {
          provide: PROJECT_REPOSITORY,
          useValue: { findById: jest.fn(), create: jest.fn(), findAll: jest.fn() },
        },
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

    useCase = module.get(GetProjectByIdUseCase);
    projectRepository = module.get(PROJECT_REPOSITORY);
    userRepository = module.get(USER_REPOSITORY);
  });

  it('debería devolver el proyecto junto con su creador', async () => {
    projectRepository.findById.mockResolvedValue(existingProject);
    userRepository.findById.mockResolvedValue(creatorUser);

    const result = await useCase.execute({ id: 'project-1' });

    expect(result.project).toBe(existingProject);
    expect(result.creator).toBe(creatorUser);
    expect(userRepository.findById).toHaveBeenCalledWith('creator-1');
  });

  it('debería devolver creator null si el creador ya no existe (desactivado)', async () => {
    projectRepository.findById.mockResolvedValue(existingProject);
    userRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute({ id: 'project-1' });

    expect(result.project).toBe(existingProject);
    expect(result.creator).toBeNull();
  });

  it('debería lanzar ProjectNotFoundError si el proyecto no existe', async () => {
    projectRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ id: 'no-existe' })).rejects.toThrow(ProjectNotFoundError);

    expect(userRepository.findById).not.toHaveBeenCalled();
  });
});

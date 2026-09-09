import { Test, TestingModule } from '@nestjs/testing';
import { RemoveMemberFromProjectUseCase } from '@modules/projects/application/remove-member-from-project.use-case';
import {
  PROJECT_REPOSITORY,
  ProjectRepositoryInterface,
} from '@modules/projects/domain/interfaces/project-repository.interface';
import {
  PROJECT_MEMBER_REPOSITORY,
  ProjectMemberRepositoryInterface,
} from '@modules/projects/domain/interfaces/project-member-repository.interface';
import {
  USER_REPOSITORY,
  UserRepositoryInterface,
} from '@modules/users/domain/interfaces/user-repository.interface';
import { UserNotFoundError } from '@modules/users/domain/exceptions/user-not-found.error';

import { Project } from '@modules/projects/domain/entities/project.entity';
import { User } from '@modules/users/domain/entities/user.entity';
import { Role } from '@ticketapp/shared-types';
import { ProjectNotFoundError } from '@modules/projects/domain/exceptions/project-not-found.exception';
import { MemberNotAssignedError } from '@modules/projects/domain/exceptions/member-not-assigned.exception';

describe('RemoveMemberFromProjectUseCase', () => {
  let useCase: RemoveMemberFromProjectUseCase;
  let projectRepository: jest.Mocked<ProjectRepositoryInterface>;
  let projectMemberRepository: jest.Mocked<ProjectMemberRepositoryInterface>;
  let userRepository: jest.Mocked<UserRepositoryInterface>;

  const existingProject = new Project('project-1', 'Test Project', null, 'admin-1');
  const clienteUser = new User('user-1', 'client@test.com', 'hash', 'Client', Role.CLIENTE);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemoveMemberFromProjectUseCase,
        {
          provide: PROJECT_REPOSITORY,
          useValue: { findById: jest.fn(), create: jest.fn() },
        },
        {
          provide: PROJECT_MEMBER_REPOSITORY,
          useValue: { exists: jest.fn(), create: jest.fn(), delete: jest.fn() },
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

    useCase = module.get(RemoveMemberFromProjectUseCase);
    projectRepository = module.get(PROJECT_REPOSITORY);
    projectMemberRepository = module.get(PROJECT_MEMBER_REPOSITORY);
    userRepository = module.get(USER_REPOSITORY);
  });

  it('debería desasignar correctamente un usuario del proyecto', async () => {
    projectRepository.findById.mockResolvedValue(existingProject);
    userRepository.findById.mockResolvedValue(clienteUser);
    projectMemberRepository.exists.mockResolvedValue(true);

    await useCase.execute({ projectId: 'project-1', userId: 'user-1' });

    expect(projectMemberRepository.delete).toHaveBeenCalledWith('project-1', 'user-1');
  });

  it('debería lanzar ProjectNotFoundError si el proyecto no existe', async () => {
    projectRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ projectId: 'no-existe', userId: 'user-1' })).rejects.toThrow(
      ProjectNotFoundError,
    );

    expect(projectMemberRepository.delete).not.toHaveBeenCalled();
  });

  it('debería lanzar UserNotFoundError si el usuario no existe', async () => {
    projectRepository.findById.mockResolvedValue(existingProject);
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ projectId: 'project-1', userId: 'no-existe' })).rejects.toThrow(
      UserNotFoundError,
    );

    expect(projectMemberRepository.delete).not.toHaveBeenCalled();
  });

  it('debería lanzar MemberNotAssignedError si el usuario no está asignado al proyecto', async () => {
    projectRepository.findById.mockResolvedValue(existingProject);
    userRepository.findById.mockResolvedValue(clienteUser);
    projectMemberRepository.exists.mockResolvedValue(false);

    await expect(useCase.execute({ projectId: 'project-1', userId: 'user-1' })).rejects.toThrow(
      MemberNotAssignedError,
    );

    expect(projectMemberRepository.delete).not.toHaveBeenCalled();
  });
});

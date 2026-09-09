import { Test, TestingModule } from '@nestjs/testing';
import { AssignMemberToProjectUseCase } from '@modules/projects/application/assign-member-to-project.use-case';
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
import { ProjectMember } from '@modules/projects/domain/entities/project-member.entity';
import { User } from '@modules/users/domain/entities/user.entity';
import { Role } from '@ticketapp/shared-types';
import {
  ID_GENERATOR_SERVICE,
  IdGeneratorServiceInterface,
} from '@shared/id-generator/domain/id-generator.inteface';
import { ProjectNotFoundError } from '@modules/projects/domain/exceptions/project-not-found.exception';
import { InvalidMemberRoleError } from '@modules/projects/domain/exceptions/invalid-member-role.exception';
import { UserAlreadyAssignedError } from '@modules/projects/domain/exceptions/user-already-assigned.exception';

describe('AssignMemberToProjectUseCase', () => {
  let useCase: AssignMemberToProjectUseCase;
  let projectRepository: jest.Mocked<ProjectRepositoryInterface>;
  let projectMemberRepository: jest.Mocked<ProjectMemberRepositoryInterface>;
  let userRepository: jest.Mocked<UserRepositoryInterface>;
  let idGeneratorService: jest.Mocked<IdGeneratorServiceInterface>;

  const existingProject = new Project('project-1', 'Test Project', null, 'admin-1');
  const clienteUser = new User('user-1', 'client@test.com', 'hash', 'Client', Role.CLIENTE);
  const adminUser = new User('admin-2', 'admin@test.com', 'hash', 'Admin', Role.ADMIN);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignMemberToProjectUseCase,
        {
          provide: PROJECT_REPOSITORY,
          useValue: { findById: jest.fn(), create: jest.fn() },
        },
        {
          provide: PROJECT_MEMBER_REPOSITORY,
          useValue: { exists: jest.fn(), create: jest.fn() },
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
        {
          provide: ID_GENERATOR_SERVICE,
          useValue: { generate: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get(AssignMemberToProjectUseCase);
    projectRepository = module.get(PROJECT_REPOSITORY);
    projectMemberRepository = module.get(PROJECT_MEMBER_REPOSITORY);
    userRepository = module.get(USER_REPOSITORY);
    idGeneratorService = module.get(ID_GENERATOR_SERVICE);
  });

  it('debería asignar correctamente un usuario válido al proyecto', async () => {
    projectRepository.findById.mockResolvedValue(existingProject);
    userRepository.findById.mockResolvedValue(clienteUser);
    projectMemberRepository.exists.mockResolvedValue(false);
    idGeneratorService.generate.mockReturnValue('member-id');

    const createdMember = new ProjectMember('member-id', 'project-1', 'user-1');
    projectMemberRepository.create.mockResolvedValue(createdMember);

    const result = await useCase.execute({ projectId: 'project-1', userId: 'user-1' });

    expect(result.member).toBe(createdMember);
    expect(projectMemberRepository.create).toHaveBeenCalledWith('member-id', 'project-1', 'user-1');
  });

  it('debería lanzar ProjectNotFoundError si el proyecto no existe', async () => {
    projectRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ projectId: 'no-existe', userId: 'user-1' })).rejects.toThrow(
      ProjectNotFoundError,
    );

    expect(projectMemberRepository.create).not.toHaveBeenCalled();
  });

  it('debería lanzar UserNotFoundError si el usuario no existe', async () => {
    projectRepository.findById.mockResolvedValue(existingProject);
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ projectId: 'project-1', userId: 'no-existe' })).rejects.toThrow(
      UserNotFoundError,
    );

    expect(projectMemberRepository.create).not.toHaveBeenCalled();
  });

  it('debería lanzar InvalidMemberRoleError si el usuario es ADMIN', async () => {
    projectRepository.findById.mockResolvedValue(existingProject);
    userRepository.findById.mockResolvedValue(adminUser);

    await expect(useCase.execute({ projectId: 'project-1', userId: 'admin-2' })).rejects.toThrow(
      InvalidMemberRoleError,
    );

    expect(projectMemberRepository.create).not.toHaveBeenCalled();
  });

  it('debería lanzar UserAlreadyAssignedError si el usuario ya estaba asignado', async () => {
    projectRepository.findById.mockResolvedValue(existingProject);
    userRepository.findById.mockResolvedValue(clienteUser);
    projectMemberRepository.exists.mockResolvedValue(true);

    await expect(useCase.execute({ projectId: 'project-1', userId: 'user-1' })).rejects.toThrow(
      UserAlreadyAssignedError,
    );

    expect(projectMemberRepository.create).not.toHaveBeenCalled();
  });
});

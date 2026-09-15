import { Test, TestingModule } from '@nestjs/testing';
import { ListProjectsUseCase } from '@modules/projects/application/list-projects.use-case';
import {
  PROJECT_REPOSITORY,
  ProjectRepositoryInterface,
} from '@modules/projects/domain/interfaces/project-repository.interface';
import { Project } from '@modules/projects/domain/entities/project.entity';
import { Role } from '@ticketapp/shared-types';

describe('ListProjectsUseCase', () => {
  let useCase: ListProjectsUseCase;
  let projectRepository: jest.Mocked<ProjectRepositoryInterface>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListProjectsUseCase,
        {
          provide: PROJECT_REPOSITORY,
          useValue: { findById: jest.fn(), create: jest.fn(), findAll: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get(ListProjectsUseCase);
    projectRepository = module.get(PROJECT_REPOSITORY);
  });

  it('debería traer todos los proyectos sin filtro de miembro si el usuario es ADMIN', async () => {
    const fakeProjects = [new Project('p-1', 'Project 1', null, 'admin-1')];
    projectRepository.findAll.mockResolvedValue({ projects: fakeProjects, total: 1 });

    const result = await useCase.execute({
      skip: 0,
      take: 10,
      requestingUser: { userId: 'admin-1', role: Role.ADMIN },
    });

    expect(projectRepository.findAll).toHaveBeenCalledWith(0, 10, undefined);
    expect(result.projects).toBe(fakeProjects);
    expect(result.total).toBe(1);
  });

  it('debería filtrar por membresía si el usuario es GESTOR', async () => {
    projectRepository.findAll.mockResolvedValue({ projects: [], total: 0 });

    await useCase.execute({
      skip: 0,
      take: 10,
      requestingUser: { userId: 'gestor-1', role: Role.GESTOR },
    });

    expect(projectRepository.findAll).toHaveBeenCalledWith(0, 10, 'gestor-1');
  });

  it('debería filtrar por membresía si el usuario es CLIENTE', async () => {
    projectRepository.findAll.mockResolvedValue({ projects: [], total: 0 });

    await useCase.execute({
      skip: 0,
      take: 10,
      requestingUser: { userId: 'cliente-1', role: Role.CLIENTE },
    });

    expect(projectRepository.findAll).toHaveBeenCalledWith(0, 10, 'cliente-1');
  });
});

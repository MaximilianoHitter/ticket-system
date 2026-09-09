import { Test, TestingModule } from '@nestjs/testing';
import { CreateProjectUseCase } from '@modules/projects/application/create-project.use-case';
import {
  PROJECT_REPOSITORY,
  ProjectRepositoryInterface,
} from '@modules/projects/domain/interfaces/project-repository.interface';

import { LOGGER_SERVICE, LoggerServiceInterface } from '@shared/logger/domain/logger.interface';
import { Project } from '@modules/projects/domain/entities/project.entity';
import {
  ID_GENERATOR_SERVICE,
  IdGeneratorServiceInterface,
} from '@shared/id-generator/domain/id-generator.inteface';

describe('CreateProjectUseCase', () => {
  let useCase: CreateProjectUseCase;
  let projectRepository: jest.Mocked<ProjectRepositoryInterface>;
  let idGeneratorService: jest.Mocked<IdGeneratorServiceInterface>;
  let logger: jest.Mocked<LoggerServiceInterface>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateProjectUseCase,
        {
          provide: PROJECT_REPOSITORY,
          useValue: { findById: jest.fn(), create: jest.fn() },
        },
        {
          provide: ID_GENERATOR_SERVICE,
          useValue: { generate: jest.fn() },
        },
        {
          provide: LOGGER_SERVICE,
          useValue: { log: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get(CreateProjectUseCase);
    projectRepository = module.get(PROJECT_REPOSITORY);
    idGeneratorService = module.get(ID_GENERATOR_SERVICE);
    logger = module.get(LOGGER_SERVICE);
  });

  it('debería crear el proyecto correctamente', async () => {
    idGeneratorService.generate.mockReturnValue('generated-id');

    const createdProject = new Project('generated-id', 'New Project', 'A description', 'admin-1');
    projectRepository.create.mockResolvedValue(createdProject);

    const result = await useCase.execute({
      name: 'New Project',
      description: 'A description',
      createdBy: 'admin-1',
    });

    expect(result.project).toBe(createdProject);
    expect(projectRepository.create).toHaveBeenCalledWith('generated-id', {
      name: 'New Project',
      description: 'A description',
      createdBy: 'admin-1',
    });
  });

  it('debería usar null como descripción si no se envía', async () => {
    idGeneratorService.generate.mockReturnValue('generated-id');
    projectRepository.create.mockImplementation(
      async (id, data) => new Project(id, data.name, data.description, data.createdBy),
    );

    await useCase.execute({
      name: 'New Project',
      createdBy: 'admin-1',
    });

    expect(projectRepository.create).toHaveBeenCalledWith('generated-id', {
      name: 'New Project',
      description: null,
      createdBy: 'admin-1',
    });
  });

  it('debería loguear y relanzar un error genérico ante una falla inesperada', async () => {
    idGeneratorService.generate.mockReturnValue('generated-id');
    projectRepository.create.mockRejectedValue(new Error('DB connection lost'));

    await expect(useCase.execute({ name: 'New Project', createdBy: 'admin-1' })).rejects.toThrow(
      'Ha ocurrido un error inesperado.',
    );

    expect(logger.error).toHaveBeenCalled();
  });
});

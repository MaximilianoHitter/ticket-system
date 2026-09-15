import { Inject, Injectable } from '@nestjs/common';
import { Project } from '../domain/entities/project.entity';
import {
  PROJECT_REPOSITORY,
  ProjectRepositoryInterface,
} from '../domain/interfaces/project-repository.interface';
import {
  ID_GENERATOR_SERVICE,
  IdGeneratorServiceInterface,
} from '@shared/id-generator/domain/id-generator.inteface';
import { LOGGER_SERVICE, LoggerServiceInterface } from '@shared/logger/domain/logger.interface';

export interface CreateProjectInput {
  name: string;
  description?: string;
  createdBy: string;
}

export interface CreateProjectOutput {
  project: Project;
}

@Injectable()
export class CreateProjectUseCase {
  private readonly ctx = CreateProjectUseCase.name;
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepositoryInterface,
    @Inject(ID_GENERATOR_SERVICE)
    private readonly idGeneratorService: IdGeneratorServiceInterface,
    @Inject(LOGGER_SERVICE)
    private readonly logger: LoggerServiceInterface,
  ) {}

  async execute(input: CreateProjectInput): Promise<CreateProjectOutput> {
    try {
      const id = this.idGeneratorService.generate();

      const project = await this.projectRepository.create(id, {
        name: input.name,
        description: input.description ?? null,
        createdBy: input.createdBy,
      });

      return { project };
    } catch (error) {
      this.logger.error(
        'Ha ocurrido un error al crear el proyecto',
        error instanceof Error ? error.stack : String(error),
        this.ctx,
      );
      throw new Error('Ha ocurrido un error inesperado.');
    }
  }
}

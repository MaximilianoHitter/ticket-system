// modules/projects/application/get-project-by-id.use-case.ts
import { Inject, Injectable } from '@nestjs/common';
import {
  PROJECT_REPOSITORY,
  ProjectRepositoryInterface,
} from '../domain/interfaces/project-repository.interface';
import {
  USER_REPOSITORY,
  UserRepositoryInterface,
} from '@modules/users/domain/interfaces/user-repository.interface';
import { ProjectNotFoundError } from '../domain/exceptions/project-not-found.exception';
import { Project } from '../domain/entities/project.entity';
import { User } from '@modules/users/domain/entities/user.entity';

export interface GetProjectByIdInput {
  id: string;
}

export interface GetProjectByIdOutput {
  project: Project;
  creator: User | null;
}

@Injectable()
export class GetProjectByIdUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepositoryInterface,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  async execute(input: GetProjectByIdInput): Promise<GetProjectByIdOutput> {
    const project = await this.projectRepository.findById(input.id);
    if (!project) throw new ProjectNotFoundError();

    const creator = await this.userRepository.findById(project.getCreatedBy());

    return { project, creator };
  }
}

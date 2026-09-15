// modules/projects/application/list-projects.use-case.ts
import { Inject, Injectable } from '@nestjs/common';
import { Role } from '@ticketapp/shared-types';
import {
  PROJECT_REPOSITORY,
  ProjectRepositoryInterface,
} from '../domain/interfaces/project-repository.interface';
import { Project } from '../domain/entities/project.entity';
import { TokenPayload } from '@shared/token/domain/token.interface';

export interface ListProjectsInput {
  skip: number;
  take: number;
  requestingUser: TokenPayload;
}

export interface ListProjectsOutput {
  projects: Project[];
  total: number;
}

@Injectable()
export class ListProjectsUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepositoryInterface,
  ) {}

  async execute(input: ListProjectsInput): Promise<ListProjectsOutput> {
    const isAdmin = input.requestingUser.role === Role.ADMIN;

    const { projects, total } = await this.projectRepository.findAll(
      input.skip,
      input.take,
      isAdmin ? undefined : input.requestingUser.userId,
    );

    return { projects, total };
  }
}

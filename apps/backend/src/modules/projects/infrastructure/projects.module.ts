import { Module } from '@nestjs/common';
import { PROJECT_REPOSITORY } from '../domain/interfaces/project-repository.interface';
import { PrismaProjectRepository } from './adapters/prisma-project.repository';
import { CreateProjectUseCase } from '../application/create-project.use-case';
import { ProjectsController } from './controllers/projects.controller';
import { IdGeneratorModule } from '@shared/id-generator/infrastructure/id-generator.module';
import { LoggerModule } from '@shared/logger/infrastructure/logger.module';
import { SecurityModule } from '@shared/security/infrastructure/security.module';
import { UsersModule } from '@modules/users/infrastructure/users.module';
import { ProjectMembersController } from './controllers/project-members.controller';
import { AssignMemberToProjectUseCase } from '../application/assign-member-to-project.use-case';
import { PROJECT_MEMBER_REPOSITORY } from '../domain/interfaces/project-member-repository.interface';
import { PrismaProjectMemberRepository } from './adapters/prisma-project-member.repository';
import { RemoveMemberFromProjectUseCase } from '../application/remove-member-from-project.use-case';
import { ListProjectsUseCase } from '../application/list-projects.use-case';
import { GetProjectByIdUseCase } from '../application/get-project-by-id.use-case';

@Module({
  imports: [IdGeneratorModule, LoggerModule, SecurityModule, UsersModule],
  controllers: [ProjectsController, ProjectMembersController],
  providers: [
    CreateProjectUseCase,
    AssignMemberToProjectUseCase,
    RemoveMemberFromProjectUseCase,
    ListProjectsUseCase,
    GetProjectByIdUseCase,
    {
      provide: PROJECT_REPOSITORY,
      useClass: PrismaProjectRepository,
    },
    {
      provide: PROJECT_MEMBER_REPOSITORY,
      useClass: PrismaProjectMemberRepository,
    },
  ],
  exports: [PROJECT_REPOSITORY, PROJECT_MEMBER_REPOSITORY],
})
export class ProjectsModule {}

import { ProjectMember } from '../entities/project-member.entity';

export const PROJECT_MEMBER_REPOSITORY = Symbol('PROJECT_MEMBER_REPOSITORY');

export interface ProjectMemberRepositoryInterface {
  exists(projectId: string, userId: string): Promise<boolean>;
  create(id: string, projectId: string, userId: string): Promise<ProjectMember>;
  delete(projectId: string, userId: string): Promise<void>;
}

import { Project } from '../entities/project.entity';

export const PROJECT_REPOSITORY = Symbol('PROJECT_REPOSITORY');

export interface CreateProjectData {
  name: string;
  description: string | null;
  createdBy: string;
}

export interface ProjectRepositoryInterface {
  findById(id: string): Promise<Project | null>;
  create(id: string, data: CreateProjectData): Promise<Project>;
}

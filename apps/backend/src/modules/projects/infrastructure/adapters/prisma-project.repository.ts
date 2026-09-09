import { Project } from '@modules/projects/domain/entities/project.entity';
import {
  CreateProjectData,
  ProjectRepositoryInterface,
} from '@modules/projects/domain/interfaces/project-repository.interface';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import { ProjectMapper } from '../mappers/project.mapper';

@Injectable()
export class PrismaProjectRepository implements ProjectRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Project | null> {
    const record = await this.prisma.projectModel.findFirst({
      where: { id, deletedAt: null },
    });
    return record ? ProjectMapper.toDomain(record) : null;
  }

  async create(id: string, data: CreateProjectData): Promise<Project> {
    const record = await this.prisma.projectModel.create({
      data: {
        id,
        name: data.name,
        description: data.description,
        createdBy: data.createdBy,
      },
    });
    return ProjectMapper.toDomain(record);
  }
}

import { ProjectMember } from '@modules/projects/domain/entities/project-member.entity';
import { ProjectMemberRepositoryInterface } from '@modules/projects/domain/interfaces/project-member-repository.interface';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';

@Injectable()
export class PrismaProjectMemberRepository implements ProjectMemberRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async exists(projectId: string, userId: string): Promise<boolean> {
    const record = await this.prisma.projectMemberModel.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });
    return record !== null;
  }

  async create(id: string, projectId: string, userId: string): Promise<ProjectMember> {
    const record = await this.prisma.projectMemberModel.create({
      data: { id, projectId, userId },
    });
    return new ProjectMember(record.id, record.projectId, record.userId);
  }

  async delete(projectId: string, userId: string): Promise<void> {
    await this.prisma.projectMemberModel.delete({
      where: { projectId_userId: { projectId, userId } },
    });
  }
}

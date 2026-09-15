import { Project } from '@modules/projects/domain/entities/project.entity';
import { ProjectModel } from '@prisma-client';

export class ProjectMapper {
  static toDomain(record: ProjectModel): Project {
    return new Project(
      record.id,
      record.name,
      record.description,
      record.createdBy,
      record.deletedAt,
    );
  }
}

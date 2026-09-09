import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Project } from '../../../domain/entities/project.entity';
import { CreateProjectOutput } from '../../../application/create-project.use-case';

export class ProjectResponseDto {
  @ApiProperty({ type: 'string' })
  id!: string;

  @ApiProperty({ type: 'string' })
  name!: string;

  @ApiPropertyOptional({ type: 'string', nullable: true })
  description!: string | null;

  @ApiProperty({ type: 'string' })
  createdBy!: string;

  static fromEntity(project: Project): ProjectResponseDto {
    const dto = new ProjectResponseDto();
    dto.id = project.getId();
    dto.name = project.getName();
    dto.description = project.getDescription();
    dto.createdBy = project.getCreatedBy();
    return dto;
  }

  static fromOutput(output: CreateProjectOutput): ProjectResponseDto {
    return ProjectResponseDto.fromEntity(output.project);
  }
}

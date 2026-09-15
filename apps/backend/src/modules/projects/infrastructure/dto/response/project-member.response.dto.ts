import { ApiProperty } from '@nestjs/swagger';
import { ProjectMember } from '../../../domain/entities/project-member.entity';
import { AssingMemberToProjectOutput } from '@modules/projects/application/assign-member-to-project.use-case';

export class ProjectMemberResponseDto {
  @ApiProperty({ type: 'string' })
  id!: string;

  @ApiProperty({ type: 'string' })
  projectId!: string;

  @ApiProperty({ type: 'string' })
  userId!: string;

  static fromEntity(member: ProjectMember): ProjectMemberResponseDto {
    const dto = new ProjectMemberResponseDto();
    dto.id = member.getId();
    dto.projectId = member.getProjectId();
    dto.userId = member.getUserId();
    return dto;
  }

  static fromOutput(output: AssingMemberToProjectOutput): ProjectMemberResponseDto {
    return ProjectMemberResponseDto.fromEntity(output.member);
  }
}

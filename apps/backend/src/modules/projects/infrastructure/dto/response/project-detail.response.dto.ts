// modules/projects/infrastructure/dto/response/project-detail.response.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GetProjectByIdOutput } from '../../../application/get-project-by-id.use-case';
import { UserResponseDto } from '@modules/users/infrastructure/dto/response/user.response.dto';

export class ProjectDetailResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional()
  description!: string | null;

  @ApiPropertyOptional({ type: UserResponseDto })
  creator!: UserResponseDto | null;

  static fromOutput(output: GetProjectByIdOutput): ProjectDetailResponseDto {
    const dto = new ProjectDetailResponseDto();
    dto.id = output.project.getId();
    dto.name = output.project.getName();
    dto.description = output.project.getDescription();
    dto.creator = output.creator ? UserResponseDto.fromEntity(output.creator) : null;
    return dto;
  }
}

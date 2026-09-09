import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiCreatedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@shared/security/infrastructure/jwt-auth.guard';
import { RolesGuard } from '@shared/security/infrastructure/roles.guard';
import { Roles } from '@shared/security/infrastructure/roles.decorator';
import { CurrentUser } from '@shared/security/infrastructure/current-user.decorator';
import { Role } from '@ticketapp/shared-types';
import { TokenPayload } from '@shared/token/domain/token.interface';
import { CreateProjectUseCase } from '@modules/projects/application/create-project.use-case';
import { ProjectResponseDto } from '../dto/response/project.response.dto';
import { CreateProjectRequestDto } from '../dto/request/create-project.request.dto';

@ApiTags('projects')
@ApiBearerAuth('token')
@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectsController {
  constructor(private readonly createProjectUseCase: CreateProjectUseCase) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Crear un proyecto (solo Admin)' })
  @ApiCreatedResponse({ type: ProjectResponseDto })
  async create(
    @Body() dto: CreateProjectRequestDto,
    @CurrentUser() currentUser: TokenPayload,
  ): Promise<ProjectResponseDto> {
    const output = await this.createProjectUseCase.execute(dto.toInput(currentUser.userId));
    return ProjectResponseDto.fromOutput(output);
  }
}

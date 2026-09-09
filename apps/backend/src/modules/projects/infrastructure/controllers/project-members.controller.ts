import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiCreatedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@shared/security/infrastructure/jwt-auth.guard';
import { RolesGuard } from '@shared/security/infrastructure/roles.guard';
import { Roles } from '@shared/security/infrastructure/roles.decorator';
import { Role } from '@ticketapp/shared-types';
import { AssignMemberToProjectUseCase } from '../../application/assign-member-to-project.use-case';
import { AssignMemberRequestDto } from '../dto/request/assign-member.request.dto';
import { ProjectMemberResponseDto } from '../dto/response/project-member.response.dto';
import { RemoveMemberFromProjectUseCase } from '@modules/projects/application/remove-member-from-project.use-case';

@ApiTags('project-members')
@ApiBearerAuth('token')
@Controller('projects/:projectId/members')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectMembersController {
  constructor(
    private readonly assignMemberToProjectUseCase: AssignMemberToProjectUseCase,
    private readonly removeMemberFromProjectUseCase: RemoveMemberFromProjectUseCase,
  ) {}

  @Post()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Asignar un usuario (Gestor o Cliente) a un proyecto (solo Admin)' })
  @ApiCreatedResponse({ type: ProjectMemberResponseDto })
  async assign(
    @Param(
      'projectId',
      new ParseUUIDPipe({
        version: '4',
        exceptionFactory: (_errors) => new BadRequestException('El Id debe ser un UUID válido'),
      }),
    )
    projectId: string,
    @Body() dto: AssignMemberRequestDto,
  ): Promise<ProjectMemberResponseDto> {
    const output = await this.assignMemberToProjectUseCase.execute({
      projectId,
      userId: dto.userId,
    });
    return ProjectMemberResponseDto.fromOutput(output);
  }

  @Delete(':userId')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Desasignar un usuario de un proyecto (solo Admin)' })
  async remove(
    @Param(
      'projectId',
      new ParseUUIDPipe({
        version: '4',
        exceptionFactory: (_errors) => new BadRequestException('El Id debe ser un UUID válido'),
      }),
    )
    projectId: string,
    @Param(
      'userId',
      new ParseUUIDPipe({
        version: '4',
        exceptionFactory: (_errors) => new BadRequestException('El Id debe ser un UUID válido'),
      }),
    )
    userId: string,
  ): Promise<void> {
    await this.removeMemberFromProjectUseCase.execute({ projectId, userId });
  }
}

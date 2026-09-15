import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@shared/security/infrastructure/jwt-auth.guard';
import { RolesGuard } from '@shared/security/infrastructure/roles.guard';
import { Roles } from '@shared/security/infrastructure/roles.decorator';
import { CurrentUser } from '@shared/security/infrastructure/current-user.decorator';
import { Role } from '@ticketapp/shared-types';
import { TokenPayload } from '@shared/token/domain/token.interface';
import { CreateProjectUseCase } from '@modules/projects/application/create-project.use-case';
import { ProjectResponseDto } from '../dto/response/project.response.dto';
import { CreateProjectRequestDto } from '../dto/request/create-project.request.dto';
import {
  ApiPaginatedResponse,
  PaginatedResponseDto,
} from '@shared/dto/response/paginated.response.dto';
import { ListProjectsRequestDto } from '../dto/request/lits-projects.request.dto';
import { ListProjectsUseCase } from '@modules/projects/application/list-projects.use-case';
import { ProjectDetailResponseDto } from '../dto/response/project-detail.response.dto';
import { GetProjectByIdUseCase } from '@modules/projects/application/get-project-by-id.use-case';
import { UuidParam } from '@shared/validation/infrastructure/uuid-param.decorator';

@ApiTags('projects')
@ApiBearerAuth('token')
@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectsController {
  constructor(
    private readonly createProjectUseCase: CreateProjectUseCase,
    private readonly listProjectsUseCase: ListProjectsUseCase,
    private readonly getProjectByIdUseCase: GetProjectByIdUseCase,
  ) {}

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

  @Get()
  @ApiOperation({ summary: 'Listar proyectos (Admin ve todos, Gestor/Cliente solo los propios)' })
  @ApiOkResponse({ type: ApiPaginatedResponse(ProjectResponseDto) })
  async list(
    @Query() dto: ListProjectsRequestDto,
    @CurrentUser() currentUser: TokenPayload,
  ): Promise<PaginatedResponseDto<ProjectResponseDto>> {
    const output = await this.listProjectsUseCase.execute({
      skip: dto.getSkip(),
      take: dto.getTake(),
      requestingUser: currentUser,
    });

    const projectsDto = output.projects.map((project) => ProjectResponseDto.fromEntity(project));

    return new PaginatedResponseDto(projectsDto, output.total, dto.page, dto.limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener el detalle de un proyecto (incluye el creador)' })
  @ApiOkResponse({ type: ProjectDetailResponseDto })
  async getById(
    @UuidParam('id', 'El id del proyecto debe ser un UUID válido') id: string,
  ): Promise<ProjectDetailResponseDto> {
    const output = await this.getProjectByIdUseCase.execute({ id });
    return ProjectDetailResponseDto.fromOutput(output);
  }
}

import { Body, Controller, Get, Patch, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@shared/security/infrastructure/jwt-auth.guard';
import { CurrentUser } from '@shared/security/infrastructure/current-user.decorator';
import { TokenPayload } from '@shared/token/domain/token.interface';
import { CreateTicketUseCase } from '@modules/tickets/application/create-ticket.use-case';
import { TicketResponseDto } from '../dto/response/ticket.response.dto';
import { CreateTicketRequestDto } from '../dto/request/create-ticket.request.dto';
import { RolesGuard } from '@shared/security/infrastructure/roles.guard';
import { Roles } from '@shared/security/infrastructure/roles.decorator';
import { Role } from '@ticketapp/shared-types';
import { UuidParam } from '@shared/validation/infrastructure/uuid-param.decorator';
import { AssignTicketUseCase } from '@modules/tickets/application/assign-ticket.use-case';
import { AssignTicketRequestDto } from '../dto/request/assign-ticket.request.dto';
import { ChangeTicketStatusRequestDto } from '../dto/request/change-ticket-status.request.dto';
import { ChangeTicketStatusUseCase } from '@modules/tickets/application/change-ticket-status.use-case';
import {
  ApiPaginatedResponse,
  PaginatedResponseDto,
} from '@shared/dto/response/paginated.response.dto';
import { ListTicketsRequestDto } from '../dto/request/list-tickets.request.dto';
import { ListTicketsUseCase } from '@modules/tickets/application/list-tickets.use-case';

@ApiTags('tickets')
@ApiBearerAuth('token')
@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
  constructor(
    private readonly createTicketUseCase: CreateTicketUseCase,
    private readonly assignTicketUseCase: AssignTicketUseCase,
    private readonly changeTicketStatusUseCase: ChangeTicketStatusUseCase,
    private readonly listTicketsUseCase: ListTicketsUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un ticket en un proyecto (Cliente/Gestor asignado, o Admin)' })
  @ApiCreatedResponse({ type: TicketResponseDto })
  async create(
    @Body() dto: CreateTicketRequestDto,
    @CurrentUser() currentUser: TokenPayload,
  ): Promise<TicketResponseDto> {
    const output = await this.createTicketUseCase.execute({
      title: dto.title,
      description: dto.description,
      projectId: dto.projectId,
      requestingUser: currentUser,
    });
    return TicketResponseDto.fromOutput(output);
  }

  @Patch(':id/assignee')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Asignar un Gestor a un ticket (solo Admin)' })
  @ApiOkResponse({ type: TicketResponseDto })
  async assign(
    @UuidParam('id', 'El id del ticket debe ser un UUID válido') id: string,
    @Body() dto: AssignTicketRequestDto,
    @CurrentUser() currentUser: TokenPayload,
  ): Promise<TicketResponseDto> {
    const output = await this.assignTicketUseCase.execute({
      ticketId: id,
      assigneeId: dto.assigneeId,
      requestingUser: currentUser,
    });
    return TicketResponseDto.fromEntity(output.ticket);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Cambiar el estado de un ticket (según reglas de transición por rol)' })
  @ApiOkResponse({ type: TicketResponseDto })
  async changeStatus(
    @UuidParam('id', 'El id del ticket debe ser un UUID válido') id: string,
    @Body() dto: ChangeTicketStatusRequestDto,
    @CurrentUser() currentUser: TokenPayload,
  ): Promise<TicketResponseDto> {
    const output = await this.changeTicketStatusUseCase.execute({
      ticketId: id,
      targetStatus: dto.status,
      requestingUser: currentUser,
    });
    return TicketResponseDto.fromEntity(output.ticket);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar tickets (Admin ve todos, Cliente y Gestor los de sus proyectos)',
  })
  @ApiOkResponse({ type: ApiPaginatedResponse(TicketResponseDto) })
  async list(
    @Query() dto: ListTicketsRequestDto,
    @CurrentUser() currentUser: TokenPayload,
  ): Promise<PaginatedResponseDto<TicketResponseDto>> {
    const output = await this.listTicketsUseCase.execute({
      skip: dto.getSkip(),
      take: dto.getTake(),
      projectId: dto.projectId,
      requestingUser: currentUser,
    });

    const ticketsDto = output.tickets.map((ticket) => TicketResponseDto.fromEntity(ticket));

    return new PaginatedResponseDto(ticketsDto, output.total, dto.page, dto.limit);
  }
}

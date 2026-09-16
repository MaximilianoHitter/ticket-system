import { Body, Controller, Patch, Post, UseGuards } from '@nestjs/common';
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

@ApiTags('tickets')
@ApiBearerAuth('token')
@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
  constructor(
    private readonly createTicketUseCase: CreateTicketUseCase,
    private readonly assignTicketUseCase: AssignTicketUseCase,
    private readonly changeTicketStatusUseCase: ChangeTicketStatusUseCase,
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
}

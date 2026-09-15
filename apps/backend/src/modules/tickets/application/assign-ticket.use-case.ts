// modules/tickets/application/assign-ticket.use-case.ts
import { Inject, Injectable } from '@nestjs/common';
import { Role } from '@ticketapp/shared-types';
import {
  TICKET_REPOSITORY,
  TicketRepositoryInterface,
} from '../domain/interfaces/ticket-repository.interface';
import {
  TICKET_HISTORY_REPOSITORY,
  TicketHistoryRepositoryInterface,
} from '../domain/interfaces/ticket-history-repository.interface';
import {
  USER_REPOSITORY,
  UserRepositoryInterface,
} from '@modules/users/domain/interfaces/user-repository.interface';
import {
  PROJECT_MEMBER_REPOSITORY,
  ProjectMemberRepositoryInterface,
} from '@modules/projects/domain/interfaces/project-member-repository.interface';
import { TicketNotFoundError } from '../domain/exceptions/ticket-not-found.exception';
import { UserNotFoundError } from '@modules/users/domain/exceptions/user-not-found.error';
import { InvalidAssigneeError } from '../domain/exceptions/invalid-assignee.exception';
import { Ticket } from '../domain/entities/ticket.entity';
import { TokenPayload } from '@shared/token/domain/token.interface';
import {
  ID_GENERATOR_SERVICE,
  IdGeneratorServiceInterface,
} from '@shared/id-generator/domain/id-generator.inteface';

export interface AssignTicketInput {
  ticketId: string;
  assigneeId: string;
  requestingUser: TokenPayload;
}

export interface AssignTicketOutput {
  ticket: Ticket;
}

@Injectable()
export class AssignTicketUseCase {
  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: TicketRepositoryInterface,
    @Inject(TICKET_HISTORY_REPOSITORY)
    private readonly ticketHistoryRepository: TicketHistoryRepositoryInterface,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(PROJECT_MEMBER_REPOSITORY)
    private readonly projectMemberRepository: ProjectMemberRepositoryInterface,
    @Inject(ID_GENERATOR_SERVICE)
    private readonly idGeneratorService: IdGeneratorServiceInterface,
  ) {}

  async execute(input: AssignTicketInput): Promise<AssignTicketOutput> {
    const ticket = await this.ticketRepository.findById(input.ticketId);
    if (!ticket) throw new TicketNotFoundError();

    const assignee = await this.userRepository.findById(input.assigneeId);
    if (!assignee) throw new UserNotFoundError();

    if (assignee.getRole() !== Role.GESTOR) {
      throw new InvalidAssigneeError('Solo usuarios GESTOR pueden ser asignados al ticket');
    }

    const isMember = await this.projectMemberRepository.exists(
      ticket.getProjectId(),
      input.assigneeId,
    );
    if (!isMember) {
      throw new InvalidAssigneeError('El asignado no es parte del proyecto');
    }

    const previousAssignee = ticket.getAssignedTo();

    const updatedTicket = await this.ticketRepository.updateAssignee(
      input.ticketId,
      input.assigneeId,
    );

    const historyId = this.idGeneratorService.generate();
    await this.ticketHistoryRepository.record(historyId, {
      ticketId: input.ticketId,
      changedBy: input.requestingUser.userId,
      previousData: { assignedTo: previousAssignee },
      newData: { assignedTo: input.assigneeId },
    });

    return { ticket: updatedTicket };
  }
}

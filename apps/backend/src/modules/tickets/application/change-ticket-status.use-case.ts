import { Inject, Injectable } from '@nestjs/common';
import { Role, TicketStatus } from '@ticketapp/shared-types';
import {
  TICKET_REPOSITORY,
  TicketRepositoryInterface,
} from '../domain/interfaces/ticket-repository.interface';
import { TicketNotFoundError } from '../domain/exceptions/ticket-not-found.exception';
import { InvalidTicketTransitionError } from '../domain/exceptions/invalid-ticket-transition.exception';
import { findTransitionRule } from '../domain/policies/ticket-transition.policy';
import { Ticket } from '../domain/entities/ticket.entity';
import { TokenPayload } from '@shared/token/domain/token.interface';
import { StartTicketHandler } from './handlers/start-ticket.handler';
import { ResolveTicketHandler } from './handlers/resolve-ticket.handler';
import { BlockTicketHandler } from './handlers/block-ticket.handler';
import { UnblockTicketHandler } from './handlers/unblock-ticket.handler';
import { CloseTicketHandler } from './handlers/close-ticket.handler';
import { AdminOverrideTicketHandler } from './handlers/admin-override-ticket.handler';

export interface ChangeTicketStatusInput {
  ticketId: string;
  targetStatus: TicketStatus;
  requestingUser: TokenPayload;
}

export interface ChangeTicketStatusOutput {
  ticket: Ticket;
}

@Injectable()
export class ChangeTicketStatusUseCase {
  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: TicketRepositoryInterface,
    private readonly startTicketHandler: StartTicketHandler,
    private readonly resolveTicketHandler: ResolveTicketHandler,
    private readonly blockTicketHandler: BlockTicketHandler,
    private readonly unblockTicketHandler: UnblockTicketHandler,
    private readonly closeTicketHandler: CloseTicketHandler,
    private readonly adminOverrideHandler: AdminOverrideTicketHandler,
  ) {}

  async execute(input: ChangeTicketStatusInput): Promise<ChangeTicketStatusOutput> {
    const ticket = await this.ticketRepository.findById(input.ticketId);
    if (!ticket) throw new TicketNotFoundError();

    const currentStatus = ticket.getStatus();
    const isAdmin = input.requestingUser.role === Role.ADMIN;
    const rule = findTransitionRule(currentStatus, input.targetStatus);

    if (rule && (isAdmin || rule.allowedRoles.includes(input.requestingUser.role))) {
      const handler = this.pickHandler(currentStatus, input.targetStatus);
      const updatedTicket = await handler.execute({ ticket, requestingUser: input.requestingUser });
      return { ticket: updatedTicket };
    }

    if (!rule && isAdmin) {
      const updatedTicket = await this.adminOverrideHandler.execute({
        ticket,
        requestingUser: input.requestingUser,
        targetStatus: input.targetStatus,
      });
      return { ticket: updatedTicket };
    }

    throw new InvalidTicketTransitionError(currentStatus, input.targetStatus);
  }

  private pickHandler(from: TicketStatus, to: TicketStatus) {
    if (from === TicketStatus.OPEN && to === TicketStatus.IN_PROGRESS)
      return this.startTicketHandler;
    if (from === TicketStatus.IN_PROGRESS && to === TicketStatus.RESOLVED)
      return this.resolveTicketHandler;
    if (from === TicketStatus.IN_PROGRESS && to === TicketStatus.BLOCKED)
      return this.blockTicketHandler;
    if (from === TicketStatus.BLOCKED && to === TicketStatus.IN_PROGRESS)
      return this.unblockTicketHandler;
    if (from === TicketStatus.RESOLVED && to === TicketStatus.CLOSED)
      return this.closeTicketHandler;
    throw new InvalidTicketTransitionError(from, to);
  }
}

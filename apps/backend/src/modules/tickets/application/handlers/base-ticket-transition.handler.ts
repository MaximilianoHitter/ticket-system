// modules/tickets/application/handlers/base-ticket-transition.handler.ts
import { Inject } from '@nestjs/common';
import { TicketStatus } from '@ticketapp/shared-types';
import {
  TICKET_REPOSITORY,
  TicketRepositoryInterface,
} from '../../domain/interfaces/ticket-repository.interface';
import {
  TICKET_HISTORY_REPOSITORY,
  TicketHistoryRepositoryInterface,
} from '../../domain/interfaces/ticket-history-repository.interface';
import {
  ID_GENERATOR_SERVICE,
  IdGeneratorServiceInterface,
} from '@shared/id-generator/domain/id-generator.inteface';

import { Ticket } from '../../domain/entities/ticket.entity';
import {
  TicketTransitionContext,
  TicketTransitionHandlerInterface,
} from '@modules/tickets/domain/interfaces/ticket-transition-handler.infertace';

export abstract class BaseTicketTransitionHandler implements TicketTransitionHandlerInterface {
  constructor(
    @Inject(TICKET_REPOSITORY)
    protected readonly ticketRepository: TicketRepositoryInterface,
    @Inject(TICKET_HISTORY_REPOSITORY)
    protected readonly ticketHistoryRepository: TicketHistoryRepositoryInterface,
    @Inject(ID_GENERATOR_SERVICE)
    protected readonly idGeneratorService: IdGeneratorServiceInterface,
  ) {}

  protected abstract getTargetStatus(): TicketStatus;
  protected getResolvedAt(): Date | null | undefined {
    return undefined; // por defecto, no toca ese campo
  }

  async execute(context: TicketTransitionContext): Promise<Ticket> {
    const previousStatus = context.ticket.getStatus();
    const targetStatus = this.getTargetStatus();

    const updatedTicket = await this.ticketRepository.updateStatus(
      context.ticket.getId(),
      targetStatus,
      this.getResolvedAt(),
    );

    const historyId = this.idGeneratorService.generate();
    await this.ticketHistoryRepository.record(historyId, {
      ticketId: context.ticket.getId(),
      changedBy: context.requestingUser.userId,
      previousData: { status: previousStatus },
      newData: { status: targetStatus },
    });

    return updatedTicket;
  }
}

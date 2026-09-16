import { Injectable } from '@nestjs/common';
import { TicketStatus } from '@ticketapp/shared-types';
import { BaseTicketTransitionHandler } from './base-ticket-transition.handler';
import { Ticket } from '../../domain/entities/ticket.entity';
import { TicketTransitionContext } from '@modules/tickets/domain/interfaces/ticket-transition-handler.infertace';

@Injectable()
export class AdminOverrideTicketHandler extends BaseTicketTransitionHandler {
  private targetStatus!: TicketStatus;

  protected getTargetStatus(): TicketStatus {
    return this.targetStatus;
  }

  protected getResolvedAt(): Date | null {
    return this.targetStatus === TicketStatus.RESOLVED ? new Date() : null;
  }

  async execute(
    context: TicketTransitionContext & { targetStatus: TicketStatus },
  ): Promise<Ticket> {
    this.targetStatus = context.targetStatus;
    return super.execute(context);
  }
}

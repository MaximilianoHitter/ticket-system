import { Injectable } from '@nestjs/common';
import { TicketStatus } from '@ticketapp/shared-types';
import { BaseTicketTransitionHandler } from './base-ticket-transition.handler';

@Injectable()
export class ResolveTicketHandler extends BaseTicketTransitionHandler {
  protected getTargetStatus(): TicketStatus {
    return TicketStatus.RESOLVED;
  }

  protected getResolvedAt(): Date {
    return new Date();
  }
}

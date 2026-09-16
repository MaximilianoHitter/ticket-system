import { Ticket } from '../entities/ticket.entity';
import { TokenPayload } from '@shared/token/domain/token.interface';

export interface TicketTransitionContext {
  ticket: Ticket;
  requestingUser: TokenPayload;
}

export interface TicketTransitionHandlerInterface {
  execute(context: TicketTransitionContext): Promise<Ticket>;
}

import { HttpStatus } from '@nestjs/common';
import { DomainError } from '@shared/domain/exceptions/domain-error';
import { TicketStatus } from '@ticketapp/shared-types';

export class InvalidTicketTransitionError extends DomainError {
  readonly statusCode = HttpStatus.BAD_REQUEST;

  constructor(from: TicketStatus, to: TicketStatus) {
    super(`No se puede mover un ticket de ${from} a ${to}`);
  }
}

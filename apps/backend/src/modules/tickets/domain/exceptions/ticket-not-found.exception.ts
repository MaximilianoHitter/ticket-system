import { HttpStatus } from '@nestjs/common';
import { DomainError } from '@shared/domain/exceptions/domain-error';

export class TicketNotFoundError extends DomainError {
  readonly statusCode = HttpStatus.NOT_FOUND;
  constructor() {
    super('Ticket not found');
  }
}

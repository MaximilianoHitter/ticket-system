import { HttpStatus } from '@nestjs/common';
import { DomainError } from './domain-error';

export class ForbiddenActionError extends DomainError {
  readonly statusCode = HttpStatus.FORBIDDEN;

  constructor(message = 'No posee permisos para realizar esta acción') {
    super(message);
  }
}

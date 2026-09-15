import { HttpStatus } from '@nestjs/common';
import { DomainError } from '@shared/domain/exceptions/domain-error';

export class MemberNotAssignedError extends DomainError {
  readonly statusCode = HttpStatus.CONFLICT;

  constructor() {
    super('El usuario no fue asignado al proyecto');
  }
}

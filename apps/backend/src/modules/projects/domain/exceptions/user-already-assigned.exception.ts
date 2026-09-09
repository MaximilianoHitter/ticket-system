import { HttpStatus } from '@nestjs/common';
import { DomainError } from '@shared/domain/exceptions/domain-error';

export class UserAlreadyAssignedError extends DomainError {
  readonly statusCode = HttpStatus.CONFLICT;

  constructor() {
    super('El usuario ya fue asignado al proyecto');
  }
}

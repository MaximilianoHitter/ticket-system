import { HttpStatus } from '@nestjs/common';
import { DomainError } from '@shared/domain/exceptions/domain-error';

export class UserAlreadyDeactivatedError extends DomainError {
  readonly statusCode = HttpStatus.CONFLICT;

  constructor() {
    super('El usuario ya ha sido desactivado');
  }
}

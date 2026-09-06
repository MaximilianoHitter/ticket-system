import { HttpStatus } from '@nestjs/common';
import { DomainError } from '@shared/domain/exceptions/domain-error';

export class UserAlreadyExistsError extends DomainError {
  readonly statusCode = HttpStatus.CONFLICT;

  constructor() {
    super('Ya existe un usuario con dicho email');
  }
}

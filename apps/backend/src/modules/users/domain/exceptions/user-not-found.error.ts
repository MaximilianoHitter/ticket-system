import { HttpStatus } from '@nestjs/common';
import { DomainError } from '@shared/domain/exceptions/domain-error';

export class UserNotFoundError extends DomainError {
  readonly statusCode = HttpStatus.NOT_FOUND;

  constructor() {
    super('El usuario no existe');
  }
}

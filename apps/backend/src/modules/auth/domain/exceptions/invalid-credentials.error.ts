import { HttpStatus } from '@nestjs/common';
import { DomainError } from '@shared/domain/exceptions/domain-error';

export class InvalidCredentialsError extends DomainError {
  readonly statusCode = HttpStatus.UNAUTHORIZED;
  constructor() {
    super('Credenciales inválidas');
  }
}

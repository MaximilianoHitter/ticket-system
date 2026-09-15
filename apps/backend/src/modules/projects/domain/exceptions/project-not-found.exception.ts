import { HttpStatus } from '@nestjs/common';
import { DomainError } from '@shared/domain/exceptions/domain-error';

export class ProjectNotFoundError extends DomainError {
  readonly statusCode = HttpStatus.NOT_FOUND;

  constructor() {
    super('Proyecto no encontrado');
  }
}

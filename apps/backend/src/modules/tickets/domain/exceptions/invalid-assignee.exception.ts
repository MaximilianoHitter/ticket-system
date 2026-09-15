import { HttpStatus } from '@nestjs/common';
import { DomainError } from '@shared/domain/exceptions/domain-error';

export class InvalidAssigneeError extends DomainError {
  readonly statusCode = HttpStatus.BAD_REQUEST;

  constructor(message: string) {
    super(message);
  }
}

import { HttpStatus } from '@nestjs/common';
import { DomainError } from '@shared/domain/exceptions/domain-error';

export class InvalidMemberRoleError extends DomainError {
  readonly statusCode = HttpStatus.BAD_REQUEST;

  constructor() {
    super('Solo usuarios con roles de GESTOR o CLIENTE se pueden asignar al proyecto');
  }
}

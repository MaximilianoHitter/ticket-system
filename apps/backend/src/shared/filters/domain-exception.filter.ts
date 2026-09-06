// shared/filters/domain-exception.filter.ts
import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { DomainError } from '@shared/domain/exceptions/domain-error';
import { Response } from 'express';

@Catch(Error)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof DomainError ? exception.statusCode : HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json({
      statusCode: status,
      message: exception.message,
    });
  }
}

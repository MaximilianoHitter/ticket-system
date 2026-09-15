import { BadRequestException, Param, ParseUUIDPipe } from '@nestjs/common';

export const UuidParam = (property: string, customMessage?: string) =>
  Param(
    property,
    new ParseUUIDPipe({
      version: '4',
      exceptionFactory: () =>
        new BadRequestException(customMessage ?? `${property} debe ser un UUID válido`),
    }),
  );

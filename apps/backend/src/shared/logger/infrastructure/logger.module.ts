import { Global, Module } from '@nestjs/common';
import { LOGGER_SERVICE } from '../domain/logger.interface';
import { NestLoggerService } from './nest-logger.service';

@Global()
@Module({
  providers: [
    {
      provide: LOGGER_SERVICE,
      useClass: NestLoggerService,
    },
  ],
  exports: [LOGGER_SERVICE],
})
export class LoggerModule {}

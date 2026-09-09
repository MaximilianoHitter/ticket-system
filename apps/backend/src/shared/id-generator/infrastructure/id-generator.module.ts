import { Module } from '@nestjs/common';
import { ID_GENERATOR_SERVICE } from '../domain/id-generator.inteface';
import { CryptoIdGeneratorService } from './crypto-id-generator.service';

@Module({
  providers: [
    {
      provide: ID_GENERATOR_SERVICE,
      useClass: CryptoIdGeneratorService,
    },
  ],
  exports: [ID_GENERATOR_SERVICE],
})
export class IdGeneratorModule {}

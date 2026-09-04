import { Module } from '@nestjs/common';
import { HASHING_SERVICE } from '../domain/hashing.interface';
import { BycrptHashingService } from './bcrypt-hashing.service';

@Module({
  providers: [
    {
      provide: HASHING_SERVICE,
      useClass: BycrptHashingService,
    },
  ],
  exports: [HASHING_SERVICE],
})
export class HashingModule {}

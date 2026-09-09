import { Injectable } from '@nestjs/common';
import { IdGeneratorServiceInterface } from '../domain/id-generator.inteface';
import { randomUUID } from 'crypto';

@Injectable()
export class CryptoIdGeneratorService implements IdGeneratorServiceInterface {
  generate(): string {
    return randomUUID();
  }
}

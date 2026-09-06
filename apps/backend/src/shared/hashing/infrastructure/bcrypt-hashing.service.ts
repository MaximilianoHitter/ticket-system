import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { HashingServiceInterface } from '../domain/hashing.interface';

const SALT_ROUNDS = 10;

@Injectable()
export class BycrptHashingService implements HashingServiceInterface {
  async hash(plainText: string): Promise<string> {
    return bcrypt.hash(plainText, SALT_ROUNDS);
  }

  async compare(plainText: string, hashedText: string): Promise<boolean> {
    return bcrypt.compare(plainText, hashedText);
  }
}

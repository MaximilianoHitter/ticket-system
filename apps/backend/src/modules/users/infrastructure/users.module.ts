import { Module } from '@nestjs/common';
import { USER_REPOSITORY } from '../domain/interfaces/user-repository.interface';
import { PrismaUserRepository } from './adapters/prisma-user.repository';
import { UsersController } from './controllers/user.controller';
import { SecurityModule } from '@shared/security/infrastructure/security.module';
import { CreateUserUseCase } from '../application/create-user.use-case';
import { HashingModule } from '@shared/hashing/infrastructure/hashing.module';

@Module({
  imports: [SecurityModule, HashingModule],
  providers: [
    CreateUserUseCase,
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
  controllers: [UsersController],
  exports: [USER_REPOSITORY],
})
export class UsersModule {}

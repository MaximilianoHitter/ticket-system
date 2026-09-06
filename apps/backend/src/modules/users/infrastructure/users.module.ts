import { Module } from '@nestjs/common';
import { USER_REPOSITORY } from '../domain/interfaces/user-repository.interface';
import { PrismaUserRepository } from './adapters/prisma-user.repository';
import { UsersController } from './controllers/user.controller';
import { SecurityModule } from '@shared/security/infrastructure/security.module';

@Module({
  imports: [SecurityModule],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
  controllers: [UsersController],
  exports: [USER_REPOSITORY],
})
export class UsersModule {}

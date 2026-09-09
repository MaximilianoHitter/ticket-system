import { Module } from '@nestjs/common';
import { USER_REPOSITORY } from '../domain/interfaces/user-repository.interface';
import { PrismaUserRepository } from './adapters/prisma-user.repository';
import { UsersController } from './controllers/user.controller';
import { SecurityModule } from '@shared/security/infrastructure/security.module';
import { CreateUserUseCase } from '../application/create-user.use-case';
import { HashingModule } from '@shared/hashing/infrastructure/hashing.module';
import { ListUsersUseCase } from '../application/list-users.use-case';
import { GetUserByIdUseCase } from '../application/get-user-by-id.use-case';
import { GetMeUseCase } from '../application/get-me.use-case';
import { EditUserUseCase } from '../application/edit-user.use-case';
import { DeactivateUserUseCase } from '../application/deactivate-user.use-case';
import { IdGeneratorModule } from '@shared/id-generator/infrastructure/id-generator.module';

@Module({
  imports: [SecurityModule, HashingModule, IdGeneratorModule],
  providers: [
    CreateUserUseCase,
    ListUsersUseCase,
    GetUserByIdUseCase,
    GetMeUseCase,
    EditUserUseCase,
    DeactivateUserUseCase,
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
  controllers: [UsersController],
  exports: [USER_REPOSITORY],
})
export class UsersModule {}

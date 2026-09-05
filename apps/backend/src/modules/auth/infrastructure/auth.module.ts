import { Module } from '@nestjs/common';
import { UsersModule } from 'src/modules/users/infrastructure/users.module';
import { HashingModule } from 'src/shared/hashing/infrastructure/hashing.module';
import { TokenModule } from 'src/shared/token/infrastructure/token.module';
import { AuthController } from './controllers/auth.controller';
import { LoginUseCase } from '../application/login.use-case';

@Module({
  imports: [UsersModule, HashingModule, TokenModule],
  controllers: [AuthController],
  providers: [LoginUseCase],
})
export class AuthModule {}

import { Module } from '@nestjs/common';
import { UsersModule } from 'src/modules/users/infrastructure/users.module';
import { AuthController } from './controllers/auth.controller';
import { LoginUseCase } from '../application/login.use-case';
import { HashingModule } from '@shared/hashing/infrastructure/hashing.module';
import { TokenModule } from '@shared/token/infrastructure/token.module';

@Module({
  imports: [UsersModule, HashingModule, TokenModule],
  controllers: [AuthController],
  providers: [LoginUseCase],
})
export class AuthModule {}

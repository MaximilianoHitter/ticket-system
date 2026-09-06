import { Module } from '@nestjs/common';
import { PrismaModule } from './shared/prisma/prisma.module';
import { AuthModule } from './modules/auth/infrastructure/auth.module';
import { LoggerModule } from './shared/logger/infrastructure/logger.module';
import { UsersModule } from '@modules/users/infrastructure/users.module';

@Module({
  imports: [PrismaModule, LoggerModule, AuthModule, UsersModule],
})
export class AppModule {}

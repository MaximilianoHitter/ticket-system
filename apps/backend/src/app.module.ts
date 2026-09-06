import { Module } from '@nestjs/common';
import { PrismaModule } from './shared/prisma/prisma.module';
import { AuthModule } from './modules/auth/infrastructure/auth.module';
import { LoggerModule } from './shared/logger/infrastructure/logger.module';

@Module({
  imports: [PrismaModule, LoggerModule, AuthModule],
})
export class AppModule {}

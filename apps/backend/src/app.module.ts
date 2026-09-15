import { Module } from '@nestjs/common';
import { PrismaModule } from './shared/prisma/prisma.module';
import { AuthModule } from './modules/auth/infrastructure/auth.module';
import { LoggerModule } from './shared/logger/infrastructure/logger.module';
import { UsersModule } from '@modules/users/infrastructure/users.module';
import { IdGeneratorModule } from '@shared/id-generator/infrastructure/id-generator.module';
import { ProjectsModule } from '@modules/projects/infrastructure/projects.module';

@Module({
  imports: [PrismaModule, LoggerModule, IdGeneratorModule, AuthModule, UsersModule, ProjectsModule],
})
export class AppModule {}

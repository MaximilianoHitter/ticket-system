import { Module } from '@nestjs/common';
import { TICKET_REPOSITORY } from '../domain/interfaces/ticket-repository.interface';
import { PrismaTicketRepository } from './adapters/prisma-ticket.repository';
import { CreateTicketUseCase } from '../application/create-ticket.use-case';
import { TicketsController } from './controllers/tickets.controller';
import { IdGeneratorModule } from '@shared/id-generator/infrastructure/id-generator.module';
import { SecurityModule } from '@shared/security/infrastructure/security.module';
import { ProjectsModule } from '@modules/projects/infrastructure/projects.module';
import { AssignTicketUseCase } from '../application/assign-ticket.use-case';
import { UsersModule } from '@modules/users/infrastructure/users.module';
import { TICKET_HISTORY_REPOSITORY } from '../domain/interfaces/ticket-history-repository.interface';
import { PrismaTicketHistoryRepository } from './adapters/prisma-ticket-history.repository';
import { ChangeTicketStatusUseCase } from '../application/change-ticket-status.use-case';
import { StartTicketHandler } from '../application/handlers/start-ticket.handler';
import { ResolveTicketHandler } from '../application/handlers/resolve-ticket.handler';
import { BlockTicketHandler } from '../application/handlers/block-ticket.handler';
import { UnblockTicketHandler } from '../application/handlers/unblock-ticket.handler';
import { CloseTicketHandler } from '../application/handlers/close-ticket.handler';
import { AdminOverrideTicketHandler } from '../application/handlers/admin-override-ticket.handler';
import { ListTicketsUseCase } from '../application/list-tickets.use-case';

@Module({
  imports: [IdGeneratorModule, SecurityModule, ProjectsModule, UsersModule],
  controllers: [TicketsController],
  providers: [
    CreateTicketUseCase,
    AssignTicketUseCase,
    ChangeTicketStatusUseCase,
    StartTicketHandler,
    ResolveTicketHandler,
    BlockTicketHandler,
    UnblockTicketHandler,
    CloseTicketHandler,
    AdminOverrideTicketHandler,
    ListTicketsUseCase,
    {
      provide: TICKET_REPOSITORY,
      useClass: PrismaTicketRepository,
    },
    {
      provide: TICKET_HISTORY_REPOSITORY,
      useClass: PrismaTicketHistoryRepository,
    },
  ],
  exports: [TICKET_REPOSITORY, TICKET_HISTORY_REPOSITORY],
})
export class TicketsModule {}

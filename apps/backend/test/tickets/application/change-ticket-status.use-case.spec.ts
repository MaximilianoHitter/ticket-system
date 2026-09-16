import { Test, TestingModule } from '@nestjs/testing';
import { ChangeTicketStatusUseCase } from '@modules/tickets/application/change-ticket-status.use-case';
import {
  TICKET_REPOSITORY,
  TicketRepositoryInterface,
} from '@modules/tickets/domain/interfaces/ticket-repository.interface';
import { StartTicketHandler } from '@modules/tickets/application/handlers/start-ticket.handler';
import { ResolveTicketHandler } from '@modules/tickets/application/handlers/resolve-ticket.handler';
import { BlockTicketHandler } from '@modules/tickets/application/handlers/block-ticket.handler';
import { UnblockTicketHandler } from '@modules/tickets/application/handlers/unblock-ticket.handler';
import { CloseTicketHandler } from '@modules/tickets/application/handlers/close-ticket.handler';
import { AdminOverrideTicketHandler } from '@modules/tickets/application/handlers/admin-override-ticket.handler';
import { TicketNotFoundError } from '@modules/tickets/domain/exceptions/ticket-not-found.exception';
import { InvalidTicketTransitionError } from '@modules/tickets/domain/exceptions/invalid-ticket-transition.exception';
import { Ticket } from '@modules/tickets/domain/entities/ticket.entity';
import { Role, TicketStatus } from '@ticketapp/shared-types';

describe('ChangeTicketStatusUseCase', () => {
  let useCase: ChangeTicketStatusUseCase;
  let ticketRepository: jest.Mocked<TicketRepositoryInterface>;
  let startTicketHandler: jest.Mocked<StartTicketHandler>;
  let resolveTicketHandler: jest.Mocked<ResolveTicketHandler>;
  let blockTicketHandler: jest.Mocked<BlockTicketHandler>;
  let unblockTicketHandler: jest.Mocked<UnblockTicketHandler>;
  let closeTicketHandler: jest.Mocked<CloseTicketHandler>;
  let adminOverrideHandler: jest.Mocked<AdminOverrideTicketHandler>;

  const openTicket = new Ticket(
    'ticket-1',
    'Title',
    'Description',
    TicketStatus.OPEN,
    'project-1',
    'client-1',
    'gestor-1',
  );

  const inProgressTicket = new Ticket(
    'ticket-1',
    'Title',
    'Description',
    TicketStatus.IN_PROGRESS,
    'project-1',
    'client-1',
    'gestor-1',
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChangeTicketStatusUseCase,
        {
          provide: TICKET_REPOSITORY,
          useValue: {
            findById: jest.fn(),
            create: jest.fn(),
            updateAssignee: jest.fn(),
            updateStatus: jest.fn(),
          },
        },
        { provide: StartTicketHandler, useValue: { execute: jest.fn() } },
        { provide: ResolveTicketHandler, useValue: { execute: jest.fn() } },
        { provide: BlockTicketHandler, useValue: { execute: jest.fn() } },
        { provide: UnblockTicketHandler, useValue: { execute: jest.fn() } },
        { provide: CloseTicketHandler, useValue: { execute: jest.fn() } },
        { provide: AdminOverrideTicketHandler, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    useCase = module.get(ChangeTicketStatusUseCase);
    ticketRepository = module.get(TICKET_REPOSITORY);
    startTicketHandler = module.get(StartTicketHandler);
    resolveTicketHandler = module.get(ResolveTicketHandler);
    blockTicketHandler = module.get(BlockTicketHandler);
    unblockTicketHandler = module.get(UnblockTicketHandler);
    closeTicketHandler = module.get(CloseTicketHandler);
    adminOverrideHandler = module.get(AdminOverrideTicketHandler);
  });

  it('debería lanzar TicketNotFoundError si el ticket no existe', async () => {
    ticketRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        ticketId: 'no-existe',
        targetStatus: TicketStatus.IN_PROGRESS,
        requestingUser: { userId: 'gestor-1', role: Role.GESTOR },
      }),
    ).rejects.toThrow(TicketNotFoundError);
  });

  it('debería llamar a StartTicketHandler cuando un GESTOR pasa OPEN -> IN_PROGRESS', async () => {
    ticketRepository.findById.mockResolvedValue(openTicket);
    startTicketHandler.execute.mockResolvedValue(inProgressTicket);

    const result = await useCase.execute({
      ticketId: 'ticket-1',
      targetStatus: TicketStatus.IN_PROGRESS,
      requestingUser: { userId: 'gestor-1', role: Role.GESTOR },
    });

    expect(startTicketHandler.execute).toHaveBeenCalled();
    expect(result.ticket).toBe(inProgressTicket);
  });

  it('debería rechazar la transición si el rol no está permitido para esa regla', async () => {
    ticketRepository.findById.mockResolvedValue(openTicket);

    await expect(
      useCase.execute({
        ticketId: 'ticket-1',
        targetStatus: TicketStatus.IN_PROGRESS,
        requestingUser: { userId: 'client-1', role: Role.CLIENTE },
      }),
    ).rejects.toThrow(InvalidTicketTransitionError);

    expect(startTicketHandler.execute).not.toHaveBeenCalled();
  });

  it('debería rechazar una transición que no existe en la tabla, para un no-Admin', async () => {
    ticketRepository.findById.mockResolvedValue(openTicket);

    await expect(
      useCase.execute({
        ticketId: 'ticket-1',
        targetStatus: TicketStatus.CLOSED,
        requestingUser: { userId: 'gestor-1', role: Role.GESTOR },
      }),
    ).rejects.toThrow(InvalidTicketTransitionError);
  });

  it('debería permitir a un Admin una transición fuera de la tabla vía AdminOverrideTicketHandler', async () => {
    ticketRepository.findById.mockResolvedValue(openTicket);
    const closedTicket = new Ticket(
      'ticket-1',
      'Title',
      'Description',
      TicketStatus.CLOSED,
      'project-1',
      'client-1',
      'gestor-1',
    );
    adminOverrideHandler.execute.mockResolvedValue(closedTicket);

    const result = await useCase.execute({
      ticketId: 'ticket-1',
      targetStatus: TicketStatus.CLOSED,
      requestingUser: { userId: 'admin-1', role: Role.ADMIN },
    });

    expect(adminOverrideHandler.execute).toHaveBeenCalledWith(
      expect.objectContaining({ targetStatus: TicketStatus.CLOSED }),
    );
    expect(result.ticket).toBe(closedTicket);
  });

  it('debería permitir a un Admin usar el handler específico si la transición sí está en la tabla', async () => {
    ticketRepository.findById.mockResolvedValue(openTicket);
    resolveTicketHandler.execute.mockResolvedValue(inProgressTicket);
    startTicketHandler.execute.mockResolvedValue(inProgressTicket);

    await useCase.execute({
      ticketId: 'ticket-1',
      targetStatus: TicketStatus.IN_PROGRESS,
      requestingUser: { userId: 'admin-1', role: Role.ADMIN },
    });

    expect(startTicketHandler.execute).toHaveBeenCalled();
    expect(adminOverrideHandler.execute).not.toHaveBeenCalled();
  });
});

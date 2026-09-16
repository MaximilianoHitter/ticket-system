import { Test, TestingModule } from '@nestjs/testing';
import { ResolveTicketHandler } from '@modules/tickets/application/handlers/resolve-ticket.handler';
import {
  TICKET_REPOSITORY,
  TicketRepositoryInterface,
} from '@modules/tickets/domain/interfaces/ticket-repository.interface';
import {
  TICKET_HISTORY_REPOSITORY,
  TicketHistoryRepositoryInterface,
} from '@modules/tickets/domain/interfaces/ticket-history-repository.interface';
import {
  ID_GENERATOR_SERVICE,
  IdGeneratorServiceInterface,
} from '@shared/id-generator/domain/id-generator.inteface';
import { Ticket } from '@modules/tickets/domain/entities/ticket.entity';
import { Role, TicketStatus } from '@ticketapp/shared-types';

describe('ResolveTicketHandler', () => {
  let handler: ResolveTicketHandler;
  let ticketRepository: jest.Mocked<TicketRepositoryInterface>;
  let ticketHistoryRepository: jest.Mocked<TicketHistoryRepositoryInterface>;
  let idGeneratorService: jest.Mocked<IdGeneratorServiceInterface>;

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
        ResolveTicketHandler,
        {
          provide: TICKET_REPOSITORY,
          useValue: {
            findById: jest.fn(),
            create: jest.fn(),
            updateAssignee: jest.fn(),
            updateStatus: jest.fn(),
          },
        },
        {
          provide: TICKET_HISTORY_REPOSITORY,
          useValue: { record: jest.fn() },
        },
        {
          provide: ID_GENERATOR_SERVICE,
          useValue: { generate: jest.fn() },
        },
      ],
    }).compile();

    handler = module.get(ResolveTicketHandler);
    ticketRepository = module.get(TICKET_REPOSITORY);
    ticketHistoryRepository = module.get(TICKET_HISTORY_REPOSITORY);
    idGeneratorService = module.get(ID_GENERATOR_SERVICE);
  });

  it('debería actualizar el estado a RESOLVED con una fecha de resolución', async () => {
    idGeneratorService.generate.mockReturnValue('history-id');
    const resolvedTicket = new Ticket(
      'ticket-1',
      'Title',
      'Description',
      TicketStatus.RESOLVED,
      'project-1',
      'client-1',
      'gestor-1',
    );
    ticketRepository.updateStatus.mockResolvedValue(resolvedTicket);

    const result = await handler.execute({
      ticket: inProgressTicket,
      requestingUser: { userId: 'gestor-1', role: Role.GESTOR },
    });

    expect(ticketRepository.updateStatus).toHaveBeenCalledWith(
      'ticket-1',
      TicketStatus.RESOLVED,
      expect.any(Date),
    );
    expect(result).toBe(resolvedTicket);
  });

  it('debería registrar el historial con el estado previo y el nuevo', async () => {
    idGeneratorService.generate.mockReturnValue('history-id');
    ticketRepository.updateStatus.mockResolvedValue(inProgressTicket);

    await handler.execute({
      ticket: inProgressTicket,
      requestingUser: { userId: 'gestor-1', role: Role.GESTOR },
    });

    expect(ticketHistoryRepository.record).toHaveBeenCalledWith('history-id', {
      ticketId: 'ticket-1',
      changedBy: 'gestor-1',
      previousData: { status: TicketStatus.IN_PROGRESS },
      newData: { status: TicketStatus.RESOLVED },
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { ListTicketsUseCase } from '@modules/tickets/application/list-tickets.use-case';
import {
  TICKET_REPOSITORY,
  TicketRepositoryInterface,
} from '@modules/tickets/domain/interfaces/ticket-repository.interface';
import { Ticket } from '@modules/tickets/domain/entities/ticket.entity';
import { Role, TicketStatus } from '@ticketapp/shared-types';

describe('ListTicketsUseCase', () => {
  let useCase: ListTicketsUseCase;
  let ticketRepository: jest.Mocked<TicketRepositoryInterface>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListTicketsUseCase,
        {
          provide: TICKET_REPOSITORY,
          useValue: {
            findById: jest.fn(),
            create: jest.fn(),
            updateAssignee: jest.fn(),
            updateStatus: jest.fn(),
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get(ListTicketsUseCase);
    ticketRepository = module.get(TICKET_REPOSITORY);
  });

  it('debería traer todos los tickets sin filtro de membresía si el usuario es ADMIN', async () => {
    const fakeTickets = [
      new Ticket('t-1', 'Title', 'Desc', TicketStatus.OPEN, 'project-1', 'client-1'),
    ];
    ticketRepository.findAll.mockResolvedValue({ tickets: fakeTickets, total: 1 });

    const result = await useCase.execute({
      skip: 0,
      take: 10,
      requestingUser: { userId: 'admin-1', role: Role.ADMIN },
    });

    expect(ticketRepository.findAll).toHaveBeenCalledWith(0, 10, {
      projectId: undefined,
      memberOfProjectUserId: undefined,
    });
    expect(result.tickets).toBe(fakeTickets);
    expect(result.total).toBe(1);
  });

  it('debería filtrar por membresía si el usuario es CLIENTE', async () => {
    ticketRepository.findAll.mockResolvedValue({ tickets: [], total: 0 });

    await useCase.execute({
      skip: 0,
      take: 10,
      requestingUser: { userId: 'client-1', role: Role.CLIENTE },
    });

    expect(ticketRepository.findAll).toHaveBeenCalledWith(0, 10, {
      projectId: undefined,
      memberOfProjectUserId: 'client-1',
    });
  });

  it('debería filtrar por membresía si el usuario es GESTOR', async () => {
    ticketRepository.findAll.mockResolvedValue({ tickets: [], total: 0 });

    await useCase.execute({
      skip: 0,
      take: 10,
      requestingUser: { userId: 'gestor-1', role: Role.GESTOR },
    });

    expect(ticketRepository.findAll).toHaveBeenCalledWith(0, 10, {
      projectId: undefined,
      memberOfProjectUserId: 'gestor-1',
    });
  });

  it('debería combinar el filtro de projectId con el scoping por rol', async () => {
    ticketRepository.findAll.mockResolvedValue({ tickets: [], total: 0 });

    await useCase.execute({
      skip: 0,
      take: 10,
      projectId: 'project-1',
      requestingUser: { userId: 'gestor-1', role: Role.GESTOR },
    });

    expect(ticketRepository.findAll).toHaveBeenCalledWith(0, 10, {
      projectId: 'project-1',
      memberOfProjectUserId: 'gestor-1',
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { AssignTicketUseCase } from '@modules/tickets/application/assign-ticket.use-case';
import {
  TICKET_REPOSITORY,
  TicketRepositoryInterface,
} from '@modules/tickets/domain/interfaces/ticket-repository.interface';
import {
  TICKET_HISTORY_REPOSITORY,
  TicketHistoryRepositoryInterface,
} from '@modules/tickets/domain/interfaces/ticket-history-repository.interface';
import {
  USER_REPOSITORY,
  UserRepositoryInterface,
} from '@modules/users/domain/interfaces/user-repository.interface';
import {
  PROJECT_MEMBER_REPOSITORY,
  ProjectMemberRepositoryInterface,
} from '@modules/projects/domain/interfaces/project-member-repository.interface';
import {
  ID_GENERATOR_SERVICE,
  IdGeneratorServiceInterface,
} from '@shared/id-generator/domain/id-generator.inteface';
import { TicketNotFoundError } from '@modules/tickets/domain/exceptions/ticket-not-found.exception';
import { UserNotFoundError } from '@modules/users/domain/exceptions/user-not-found.error';
import { InvalidAssigneeError } from '@modules/tickets/domain/exceptions/invalid-assignee.exception';
import { Ticket } from '@modules/tickets/domain/entities/ticket.entity';
import { User } from '@modules/users/domain/entities/user.entity';
import { Role, TicketStatus } from '@ticketapp/shared-types';

describe('AssignTicketUseCase', () => {
  let useCase: AssignTicketUseCase;
  let ticketRepository: jest.Mocked<TicketRepositoryInterface>;
  let ticketHistoryRepository: jest.Mocked<TicketHistoryRepositoryInterface>;
  let userRepository: jest.Mocked<UserRepositoryInterface>;
  let projectMemberRepository: jest.Mocked<ProjectMemberRepositoryInterface>;
  let idGeneratorService: jest.Mocked<IdGeneratorServiceInterface>;

  const existingTicket = new Ticket(
    'ticket-1',
    'Title',
    'Description',
    TicketStatus.OPEN,
    'project-1',
    'client-1',
    null,
  );

  const gestorUser = new User('gestor-1', 'gestor@test.com', 'hash', 'Gestor', Role.GESTOR);
  const clienteUser = new User('client-1', 'client@test.com', 'hash', 'Client', Role.CLIENTE);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignTicketUseCase,
        {
          provide: TICKET_REPOSITORY,
          useValue: { findById: jest.fn(), create: jest.fn(), updateAssignee: jest.fn() },
        },
        {
          provide: TICKET_HISTORY_REPOSITORY,
          useValue: { record: jest.fn() },
        },
        {
          provide: USER_REPOSITORY,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            deactivate: jest.fn(),
            findAll: jest.fn(),
          },
        },
        {
          provide: PROJECT_MEMBER_REPOSITORY,
          useValue: { exists: jest.fn(), create: jest.fn(), delete: jest.fn() },
        },
        {
          provide: ID_GENERATOR_SERVICE,
          useValue: { generate: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get(AssignTicketUseCase);
    ticketRepository = module.get(TICKET_REPOSITORY);
    ticketHistoryRepository = module.get(TICKET_HISTORY_REPOSITORY);
    userRepository = module.get(USER_REPOSITORY);
    projectMemberRepository = module.get(PROJECT_MEMBER_REPOSITORY);
    idGeneratorService = module.get(ID_GENERATOR_SERVICE);
  });

  it('debería asignar correctamente un Gestor miembro del proyecto y registrar el historial', async () => {
    ticketRepository.findById.mockResolvedValue(existingTicket);
    userRepository.findById.mockResolvedValue(gestorUser);
    projectMemberRepository.exists.mockResolvedValue(true);
    idGeneratorService.generate.mockReturnValue('history-id');

    const updatedTicket = new Ticket(
      'ticket-1',
      'Title',
      'Description',
      TicketStatus.OPEN,
      'project-1',
      'client-1',
      'gestor-1',
    );
    ticketRepository.updateAssignee.mockResolvedValue(updatedTicket);

    const result = await useCase.execute({
      ticketId: 'ticket-1',
      assigneeId: 'gestor-1',
      requestingUser: { userId: 'admin-1', role: Role.ADMIN },
    });

    expect(result.ticket).toBe(updatedTicket);
    expect(ticketHistoryRepository.record).toHaveBeenCalledWith('history-id', {
      ticketId: 'ticket-1',
      changedBy: 'admin-1',
      previousData: { assignedTo: null },
      newData: { assignedTo: 'gestor-1' },
    });
  });

  it('debería lanzar TicketNotFoundError si el ticket no existe', async () => {
    ticketRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        ticketId: 'no-existe',
        assigneeId: 'gestor-1',
        requestingUser: { userId: 'admin-1', role: Role.ADMIN },
      }),
    ).rejects.toThrow(TicketNotFoundError);
  });

  it('debería lanzar UserNotFoundError si el asignado no existe', async () => {
    ticketRepository.findById.mockResolvedValue(existingTicket);
    userRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        ticketId: 'ticket-1',
        assigneeId: 'no-existe',
        requestingUser: { userId: 'admin-1', role: Role.ADMIN },
      }),
    ).rejects.toThrow(UserNotFoundError);
  });

  it('debería lanzar InvalidAssigneeError si el usuario no es GESTOR', async () => {
    ticketRepository.findById.mockResolvedValue(existingTicket);
    userRepository.findById.mockResolvedValue(clienteUser);

    await expect(
      useCase.execute({
        ticketId: 'ticket-1',
        assigneeId: 'client-1',
        requestingUser: { userId: 'admin-1', role: Role.ADMIN },
      }),
    ).rejects.toThrow(InvalidAssigneeError);

    expect(ticketRepository.updateAssignee).not.toHaveBeenCalled();
  });

  it('debería lanzar InvalidAssigneeError si el Gestor no es miembro del proyecto', async () => {
    ticketRepository.findById.mockResolvedValue(existingTicket);
    userRepository.findById.mockResolvedValue(gestorUser);
    projectMemberRepository.exists.mockResolvedValue(false);

    await expect(
      useCase.execute({
        ticketId: 'ticket-1',
        assigneeId: 'gestor-1',
        requestingUser: { userId: 'admin-1', role: Role.ADMIN },
      }),
    ).rejects.toThrow(InvalidAssigneeError);

    expect(ticketRepository.updateAssignee).not.toHaveBeenCalled();
  });
});

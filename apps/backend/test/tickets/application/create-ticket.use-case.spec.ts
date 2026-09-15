import { Test, TestingModule } from '@nestjs/testing';
import { CreateTicketUseCase } from '@modules/tickets/application/create-ticket.use-case';
import {
  TICKET_REPOSITORY,
  TicketRepositoryInterface,
} from '@modules/tickets/domain/interfaces/ticket-repository.interface';
import {
  PROJECT_REPOSITORY,
  ProjectRepositoryInterface,
} from '@modules/projects/domain/interfaces/project-repository.interface';
import {
  PROJECT_MEMBER_REPOSITORY,
  ProjectMemberRepositoryInterface,
} from '@modules/projects/domain/interfaces/project-member-repository.interface';

import { ProjectNotFoundError } from '@modules/projects/domain/exceptions/project-not-found.exception';

import { Project } from '@modules/projects/domain/entities/project.entity';
import { Ticket } from '@modules/tickets/domain/entities/ticket.entity';
import { Role, TicketStatus } from '@ticketapp/shared-types';
import {
  ID_GENERATOR_SERVICE,
  IdGeneratorServiceInterface,
} from '@shared/id-generator/domain/id-generator.inteface';
import { ForbiddenActionError } from '@shared/domain/exceptions/forbidden-action-error';

describe('CreateTicketUseCase', () => {
  let useCase: CreateTicketUseCase;
  let ticketRepository: jest.Mocked<TicketRepositoryInterface>;
  let projectRepository: jest.Mocked<ProjectRepositoryInterface>;
  let projectMemberRepository: jest.Mocked<ProjectMemberRepositoryInterface>;
  let idGeneratorService: jest.Mocked<IdGeneratorServiceInterface>;

  const existingProject = new Project('project-1', 'Test Project', null, 'admin-1');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTicketUseCase,
        {
          provide: TICKET_REPOSITORY,
          useValue: { findById: jest.fn(), create: jest.fn(), updateAssignee: jest.fn() },
        },
        {
          provide: PROJECT_REPOSITORY,
          useValue: { findById: jest.fn(), create: jest.fn(), findAll: jest.fn() },
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

    useCase = module.get(CreateTicketUseCase);
    ticketRepository = module.get(TICKET_REPOSITORY);
    projectRepository = module.get(PROJECT_REPOSITORY);
    projectMemberRepository = module.get(PROJECT_MEMBER_REPOSITORY);
    idGeneratorService = module.get(ID_GENERATOR_SERVICE);
  });

  it('debería permitir a un Admin crear un ticket sin ser miembro del proyecto', async () => {
    projectRepository.findById.mockResolvedValue(existingProject);
    idGeneratorService.generate.mockReturnValue('ticket-id');

    const createdTicket = new Ticket(
      'ticket-id',
      'Title',
      'Description',
      TicketStatus.OPEN,
      'project-1',
      'admin-1',
    );
    ticketRepository.create.mockResolvedValue(createdTicket);

    const result = await useCase.execute({
      title: 'Title',
      description: 'Description',
      projectId: 'project-1',
      requestingUser: { userId: 'admin-1', role: Role.ADMIN },
    });

    expect(result.ticket).toBe(createdTicket);
    expect(projectMemberRepository.exists).not.toHaveBeenCalled();
  });

  it('debería permitir a un miembro del proyecto (Cliente/Gestor) crear un ticket', async () => {
    projectRepository.findById.mockResolvedValue(existingProject);
    projectMemberRepository.exists.mockResolvedValue(true);
    idGeneratorService.generate.mockReturnValue('ticket-id');

    const createdTicket = new Ticket(
      'ticket-id',
      'Title',
      'Description',
      TicketStatus.OPEN,
      'project-1',
      'client-1',
    );
    ticketRepository.create.mockResolvedValue(createdTicket);

    const result = await useCase.execute({
      title: 'Title',
      description: 'Description',
      projectId: 'project-1',
      requestingUser: { userId: 'client-1', role: Role.CLIENTE },
    });

    expect(result.ticket).toBe(createdTicket);
  });

  it('debería lanzar ForbiddenActionError si el usuario no es miembro del proyecto', async () => {
    projectRepository.findById.mockResolvedValue(existingProject);
    projectMemberRepository.exists.mockResolvedValue(false);

    await expect(
      useCase.execute({
        title: 'Title',
        description: 'Description',
        projectId: 'project-1',
        requestingUser: { userId: 'client-1', role: Role.CLIENTE },
      }),
    ).rejects.toThrow(ForbiddenActionError);

    expect(ticketRepository.create).not.toHaveBeenCalled();
  });

  it('debería lanzar ProjectNotFoundError si el proyecto no existe', async () => {
    projectRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        title: 'Title',
        description: 'Description',
        projectId: 'no-existe',
        requestingUser: { userId: 'admin-1', role: Role.ADMIN },
      }),
    ).rejects.toThrow(ProjectNotFoundError);
  });
});

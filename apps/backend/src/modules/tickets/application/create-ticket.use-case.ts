import { Inject, Injectable } from '@nestjs/common';
import { Role } from '@ticketapp/shared-types';
import {
  TICKET_REPOSITORY,
  TicketRepositoryInterface,
} from '../domain/interfaces/ticket-repository.interface';
import {
  PROJECT_REPOSITORY,
  ProjectRepositoryInterface,
} from '@modules/projects/domain/interfaces/project-repository.interface';
import {
  PROJECT_MEMBER_REPOSITORY,
  ProjectMemberRepositoryInterface,
} from '@modules/projects/domain/interfaces/project-member-repository.interface';

import { ProjectNotFoundError } from '@modules/projects/domain/exceptions/project-not-found.exception';
import { Ticket } from '../domain/entities/ticket.entity';
import { TokenPayload } from '@shared/token/domain/token.interface';
import {
  ID_GENERATOR_SERVICE,
  IdGeneratorServiceInterface,
} from '@shared/id-generator/domain/id-generator.inteface';
import { ForbiddenActionError } from '@shared/domain/exceptions/forbidden-action-error';

export interface CreateTicketInput {
  title: string;
  description: string;
  projectId: string;
  requestingUser: TokenPayload;
}

export interface CreateTicketOutput {
  ticket: Ticket;
}

@Injectable()
export class CreateTicketUseCase {
  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: TicketRepositoryInterface,
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepositoryInterface,
    @Inject(PROJECT_MEMBER_REPOSITORY)
    private readonly projectMemberRepository: ProjectMemberRepositoryInterface,
    @Inject(ID_GENERATOR_SERVICE)
    private readonly idGeneratorService: IdGeneratorServiceInterface,
  ) {}

  async execute(input: CreateTicketInput): Promise<CreateTicketOutput> {
    const project = await this.projectRepository.findById(input.projectId);
    if (!project) throw new ProjectNotFoundError();

    const isAdmin = input.requestingUser.role === Role.ADMIN;

    if (!isAdmin) {
      const isMember = await this.projectMemberRepository.exists(
        input.projectId,
        input.requestingUser.userId,
      );
      if (!isMember) throw new ForbiddenActionError('No estás asignado a este proyecto');
    }

    const id = this.idGeneratorService.generate();
    const ticket = await this.ticketRepository.create(id, {
      title: input.title,
      description: input.description,
      projectId: input.projectId,
      createdBy: input.requestingUser.userId,
    });

    return { ticket };
  }
}

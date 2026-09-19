// modules/tickets/application/list-tickets.use-case.ts
import { Inject, Injectable } from '@nestjs/common';
import { Role } from '@ticketapp/shared-types';
import {
  TICKET_REPOSITORY,
  TicketRepositoryInterface,
} from '../domain/interfaces/ticket-repository.interface';
import { Ticket } from '../domain/entities/ticket.entity';
import { TokenPayload } from '@shared/token/domain/token.interface';

export interface ListTicketsInput {
  skip: number;
  take: number;
  projectId?: string;
  requestingUser: TokenPayload;
}

export interface ListTicketsOutput {
  tickets: Ticket[];
  total: number;
}

@Injectable()
export class ListTicketsUseCase {
  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: TicketRepositoryInterface,
  ) {}

  async execute(input: ListTicketsInput): Promise<ListTicketsOutput> {
    const { role, userId } = input.requestingUser;
    const isAdmin = role === Role.ADMIN;

    const filter = {
      projectId: input.projectId,
      memberOfProjectUserId: isAdmin ? undefined : userId,
    };

    const { tickets, total } = await this.ticketRepository.findAll(input.skip, input.take, filter);

    return { tickets, total };
  }
}

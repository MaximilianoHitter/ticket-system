import { TicketModel } from '../../../../generated/prisma/client';
import { Ticket } from '../../domain/entities/ticket.entity';
import { TicketStatusMapper } from './ticket-status.mapper';

export class TicketMapper {
  static toDomain(record: TicketModel): Ticket {
    return new Ticket(
      record.id,
      record.title,
      record.description,
      TicketStatusMapper.toDomain(record.status),
      record.projectId,
      record.createdBy,
      record.assignedTo,
    );
  }
}

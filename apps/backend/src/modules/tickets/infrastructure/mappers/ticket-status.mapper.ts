import { TicketStatusModel } from '../../../../generated/prisma/client';
import { TicketStatus } from '@ticketapp/shared-types';

export class TicketStatusMapper {
  static toDomain(status: TicketStatusModel): TicketStatus {
    switch (status) {
      case TicketStatusModel.OPEN:
        return TicketStatus.OPEN;
      case TicketStatusModel.IN_PROGRESS:
        return TicketStatus.IN_PROGRESS;
      case TicketStatusModel.RESOLVED:
        return TicketStatus.RESOLVED;
      case TicketStatusModel.BLOCKED:
        return TicketStatus.BLOCKED;
      case TicketStatusModel.CLOSED:
        return TicketStatus.CLOSED;
    }
  }

  static toPersistence(status: TicketStatus): TicketStatusModel {
    switch (status) {
      case TicketStatus.OPEN:
        return TicketStatusModel.OPEN;
      case TicketStatus.IN_PROGRESS:
        return TicketStatusModel.IN_PROGRESS;
      case TicketStatus.RESOLVED:
        return TicketStatusModel.RESOLVED;
      case TicketStatus.BLOCKED:
        return TicketStatusModel.BLOCKED;
      case TicketStatus.CLOSED:
        return TicketStatusModel.CLOSED;
    }
  }
}

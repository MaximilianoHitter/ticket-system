import { JsonValue } from '@shared/domain/types/json-value.type';

export const TICKET_HISTORY_REPOSITORY = Symbol('TICKET_HISTORY_REPOSITORY');

export interface RecordTicketChangeData {
  ticketId: string;
  changedBy: string;
  previousData: JsonValue;
  newData: JsonValue;
}

export interface TicketHistoryRepositoryInterface {
  record(id: string, data: RecordTicketChangeData): Promise<void>;
}

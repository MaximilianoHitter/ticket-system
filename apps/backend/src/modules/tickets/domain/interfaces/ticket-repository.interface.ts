import { TicketStatus } from '@ticketapp/shared-types';
import { Ticket } from '../entities/ticket.entity';

export const TICKET_REPOSITORY = Symbol('TICKET_REPOSITORY');

export interface CreateTicketData {
  title: string;
  description: string;
  projectId: string;
  createdBy: string;
}

export interface TicketRepositoryInterface {
  findById(id: string): Promise<Ticket | null>;
  create(id: string, data: CreateTicketData): Promise<Ticket>;
  updateAssignee(id: string, assignedTo: string): Promise<Ticket>;
  updateStatus(id: string, status: TicketStatus, resolvedAt?: Date | null): Promise<Ticket>;
}

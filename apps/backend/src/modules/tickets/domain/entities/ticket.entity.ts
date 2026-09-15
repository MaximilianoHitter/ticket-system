import { TicketStatus } from '@ticketapp/shared-types';

export class Ticket {
  constructor(
    private readonly id: string,
    private readonly title: string,
    private readonly description: string,
    private readonly status: TicketStatus,
    private readonly projectId: string,
    private readonly createdBy: string,
    private readonly assignedTo: string | null = null,
  ) {}

  getId(): string {
    return this.id;
  }

  getTitle(): string {
    return this.title;
  }

  getDescription(): string {
    return this.description;
  }

  getStatus(): TicketStatus {
    return this.status;
  }

  getProjectId(): string {
    return this.projectId;
  }

  getCreatedBy(): string {
    return this.createdBy;
  }

  getAssignedTo(): string | null {
    return this.assignedTo;
  }
}

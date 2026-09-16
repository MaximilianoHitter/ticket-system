import { Role, TicketStatus } from '@ticketapp/shared-types';

export interface TicketTransitionRule {
  from: TicketStatus;
  to: TicketStatus;
  allowedRoles: Role[];
}

export const TICKET_TRANSITIONS: TicketTransitionRule[] = [
  { from: TicketStatus.OPEN, to: TicketStatus.IN_PROGRESS, allowedRoles: [Role.GESTOR] },
  { from: TicketStatus.IN_PROGRESS, to: TicketStatus.RESOLVED, allowedRoles: [Role.GESTOR] },
  { from: TicketStatus.IN_PROGRESS, to: TicketStatus.BLOCKED, allowedRoles: [Role.GESTOR] },
  { from: TicketStatus.BLOCKED, to: TicketStatus.IN_PROGRESS, allowedRoles: [Role.GESTOR] },
  { from: TicketStatus.RESOLVED, to: TicketStatus.CLOSED, allowedRoles: [Role.CLIENTE] },
];

export function findTransitionRule(
  from: TicketStatus,
  to: TicketStatus,
): TicketTransitionRule | undefined {
  return TICKET_TRANSITIONS.find((rule) => rule.from === from && rule.to === to);
}

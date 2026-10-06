import type { TicketPriority } from './ticketPriority';
import type { TicketStatus } from './ticketStatus';

/** Ticket as returned by GET/POST/PUT /api/tickets. History is loaded from GET /api/tickets/{id}/history. */
export interface Ticket {
  id: number;
  title: string;
  assetCode: string;
  description: string | null;
  priority: TicketPriority;
  status: TicketStatus;
  diagnosis: string | null;
  resolution: string | null;
  reportedBy: string;
  createdAt: string;
  updatedAt: string;
}

/** Body of POST /api/tickets (CreateTicketDto). */
export interface CreateTicketRequest {
  title: string;
  assetCode: string;
  description: string | null;
  priority: TicketPriority;
  reportedBy: string;
}

/** Body of PUT /api/tickets/{id}/status (ChangeStatusDto). */
export interface ChangeTicketStatusRequest {
  newStatus: TicketStatus;
  diagnosis: string | null;
  resolution: string | null;
  performedBy: string;
  comment: string | null;
}

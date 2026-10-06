import type { ChangeTicketStatusRequest, CreateTicketRequest, Ticket } from '../models/ticket';
import type { TicketHistoryEntry } from '../models/ticketHistory';
import { request } from './httpClient';

const TICKETS_PATH = '/api/tickets';

/** Trims text and converts empty values to null for nullable API fields. */
function toNullableText(value: string | null): string | null {
  const trimmedValue = value?.trim() ?? '';
  return trimmedValue === '' ? null : trimmedValue;
}

export const ticketService = {
  /** GET /api/tickets */
  getTickets(signal?: AbortSignal): Promise<Ticket[]> {
    return request<Ticket[]>(TICKETS_PATH, { signal });
  },

  /** GET /api/tickets/{id} */
  getTicketById(id: number, signal?: AbortSignal): Promise<Ticket> {
    return request<Ticket>(`${TICKETS_PATH}/${id}`, { signal });
  },

  /** POST /api/tickets */
  createTicket(ticket: CreateTicketRequest): Promise<Ticket> {
    const body: CreateTicketRequest = {
      title: ticket.title.trim(),
      assetCode: ticket.assetCode.trim(),
      description: toNullableText(ticket.description),
      priority: ticket.priority,
      reportedBy: ticket.reportedBy.trim(),
    };
    return request<Ticket>(TICKETS_PATH, { method: 'POST', body });
  },

  /** PUT /api/tickets/{id}/status */
  changeTicketStatus(id: number, change: ChangeTicketStatusRequest): Promise<Ticket> {
    const body: ChangeTicketStatusRequest = {
      newStatus: change.newStatus,
      diagnosis: toNullableText(change.diagnosis),
      resolution: toNullableText(change.resolution),
      performedBy: change.performedBy.trim(),
      comment: toNullableText(change.comment),
    };
    return request<Ticket>(`${TICKETS_PATH}/${id}/status`, { method: 'PUT', body });
  },

  /** GET /api/tickets/{id}/history */
  getTicketHistory(id: number, signal?: AbortSignal): Promise<TicketHistoryEntry[]> {
    return request<TicketHistoryEntry[]>(`${TICKETS_PATH}/${id}/history`, { signal });
  },
};

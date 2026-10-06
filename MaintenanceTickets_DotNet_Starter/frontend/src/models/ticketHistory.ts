import type { TicketStatus } from './ticketStatus';

export type HistoryEventType = 'CREATED' | 'STATUS_CHANGED';

/** Entry returned by GET /api/tickets/{id}/history. */
export interface TicketHistoryEntry {
  id: number;
  ticketId: number;
  eventType: HistoryEventType;
  fromStatus: TicketStatus | null;
  toStatus: TicketStatus | null;
  comment: string | null;
  performedBy: string;
  createdAt: string;
}

export const HISTORY_EVENT_LABELS: Record<HistoryEventType, string> = {
  CREATED: 'Ticket creado',
  STATUS_CHANGED: 'Cambio de estado',
};

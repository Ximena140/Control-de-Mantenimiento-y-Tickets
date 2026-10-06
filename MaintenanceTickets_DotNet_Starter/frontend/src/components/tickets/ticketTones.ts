import type { TicketPriority } from '../../models/ticketPriority';
import type { TicketStatus } from '../../models/ticketStatus';
import type { PillTone } from '../ui/Pill';

/** Color of each status column, reused by the pills inside it. */
export const STATUS_TONES: Record<TicketStatus, PillTone> = {
  PENDING: 'warning',
  IN_PROGRESS: 'info',
  RESOLVED: 'success',
};

export const PRIORITY_TONES: Record<TicketPriority, PillTone> = {
  LOW: 'neutral',
  MEDIUM: 'info',
  HIGH: 'warning',
  CRITICAL: 'danger',
};

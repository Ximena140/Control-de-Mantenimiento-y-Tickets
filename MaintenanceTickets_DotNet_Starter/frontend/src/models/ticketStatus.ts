export type TicketStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En Proceso',
  RESOLVED: 'Resuelto',
};

/** Statuses shown as Kanban columns, in board order. */
export const BOARD_STATUSES: readonly TicketStatus[] = ['PENDING', 'IN_PROGRESS', 'RESOLVED'];

/**
 * Next status of each status.
 *
 * Mirrors the backend state machine (TicketStatus.CanTransition and
 * sp_TransitionTicketStatus): PENDING → IN_PROGRESS → RESOLVED.
 * The backend remains the final authority and rejects any other transition with 409.
 */
const NEXT_STATUS: Partial<Record<TicketStatus, TicketStatus>> = {
  PENDING: 'IN_PROGRESS',
  IN_PROGRESS: 'RESOLVED',
};

export function getNextStatus(status: TicketStatus): TicketStatus | null {
  return NEXT_STATUS[status] ?? null;
}

export function canTransition(currentStatus: TicketStatus, targetStatus: TicketStatus): boolean {
  return getNextStatus(currentStatus) === targetStatus;
}

/** Button label for the action that moves a ticket into each target status. */
export const TRANSITION_ACTION_LABELS: Partial<Record<TicketStatus, string>> = {
  IN_PROGRESS: 'Iniciar atención',
  RESOLVED: 'Marcar como resuelto',
};

export type TransitionDetailField = 'diagnosis' | 'resolution';

/** Detail the backend requires to enter each target status. */
export const REQUIRED_TRANSITION_DETAIL: Partial<Record<TicketStatus, TransitionDetailField>> = {
  IN_PROGRESS: 'diagnosis',
  RESOLVED: 'resolution',
};

import { useMemo } from 'react';
import type { Ticket } from '../../models/ticket';
import { BOARD_STATUSES, type TicketStatus } from '../../models/ticketStatus';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import styles from './TicketBoard.module.css';
import { TicketColumn } from './TicketColumn';

interface TicketBoardProps {
  tickets: Ticket[];
  isLoading: boolean;
  loadError: string | null;
  transitioningTicketId: number | null;
  onRetry: () => void;
  onSelectTicket: (ticketId: number) => void;
  onRequestTransition: (ticket: Ticket) => void;
}

export function TicketBoard({ tickets, isLoading, loadError, transitioningTicketId, onRetry, onSelectTicket, onRequestTransition }: TicketBoardProps) {
  const ticketsByStatus = useMemo(() => groupByBoardStatus(tickets), [tickets]);
  const hasTickets = tickets.length > 0;

  if (isLoading && !hasTickets) {
    return <Spinner label="Cargando tickets…" />;
  }

  return (
    <div className={styles.container}>
      {loadError && (
        <Alert
          variant="error"
          message={loadError}
          action={
            <Button variant="secondary" size="small" onClick={onRetry}>
              Reintentar
            </Button>
          }
        />
      )}
      <div className={styles.board}>
        {BOARD_STATUSES.map((status) => (
          <TicketColumn
            key={status}
            status={status}
            tickets={ticketsByStatus.get(status) ?? []}
            transitioningTicketId={transitioningTicketId}
            onSelectTicket={onSelectTicket}
            onRequestTransition={onRequestTransition}
          />
        ))}
      </div>
    </div>
  );
}

/** Keeps the API order inside each column. */
function groupByBoardStatus(tickets: Ticket[]): Map<TicketStatus, Ticket[]> {
  const groups = new Map<TicketStatus, Ticket[]>(BOARD_STATUSES.map((status) => [status, []]));
  for (const ticket of tickets) {
    groups.get(ticket.status)?.push(ticket);
  }
  return groups;
}

import { useId } from 'react';
import type { Ticket } from '../../models/ticket';
import type { TicketStatus } from '../../models/ticketStatus';
import { EmptyState } from '../ui/EmptyState';
import { StatusBadge } from './StatusBadge';
import { TicketCard } from './TicketCard';
import styles from './TicketColumn.module.css';

interface TicketColumnProps {
  status: TicketStatus;
  tickets: Ticket[];
  transitioningTicketId: number | null;
  onSelectTicket: (ticketId: number) => void;
  onRequestTransition: (ticket: Ticket) => void;
}

export function TicketColumn({ status, tickets, transitioningTicketId, onSelectTicket, onRequestTransition }: TicketColumnProps) {
  const headingId = useId();

  return (
    <section className={styles.column} aria-labelledby={headingId}>
      <h3 id={headingId} className={styles.header}>
        <StatusBadge status={status} />
        <span className={styles.count} aria-label={`${tickets.length} tickets`}>
          {tickets.length}
        </span>
      </h3>
      {tickets.length === 0 ? (
        <EmptyState message="No hay tickets" />
      ) : (
        <ul className={styles.list}>
          {tickets.map((ticket) => (
            <li key={ticket.id}>
              <TicketCard
                ticket={ticket}
                isTransitioning={transitioningTicketId === ticket.id}
                onSelect={onSelectTicket}
                onRequestTransition={onRequestTransition}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

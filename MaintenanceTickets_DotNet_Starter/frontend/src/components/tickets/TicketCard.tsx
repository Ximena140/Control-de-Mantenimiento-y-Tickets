import type { Ticket } from '../../models/ticket';
import { getNextStatus, TRANSITION_ACTION_LABELS } from '../../models/ticketStatus';
import { Button } from '../ui/Button';
import { Pill } from '../ui/Pill';
import styles from './TicketCard.module.css';
import { STATUS_TONES } from './ticketTones';

interface TicketCardProps {
  ticket: Ticket;
  isTransitioning: boolean;
  onSelect: (ticketId: number) => void;
  onRequestTransition: (ticket: Ticket) => void;
}

/** Whole card opens the ticket detail; the only extra control is the next valid transition, if any. */
export function TicketCard({ ticket, isTransitioning, onSelect, onRequestTransition }: TicketCardProps) {
  const nextStatus = getNextStatus(ticket.status);

  return (
    <article className={styles.card}>
      <span className={styles.ticketNumber}>#{ticket.id}</span>
      <h4 className={styles.title}>
        <button type="button" className={styles.openButton} onClick={() => onSelect(ticket.id)} title="Ver detalle e historial">
          {ticket.title}
        </button>
      </h4>
      <Pill tone={STATUS_TONES[ticket.status] ?? 'neutral'}>{ticket.assetCode}</Pill>
      {nextStatus && (
        <div className={styles.actions}>
          <Button variant="ghost" size="small" isLoading={isTransitioning} loadingText="Guardando…" onClick={() => onRequestTransition(ticket)}>
            {TRANSITION_ACTION_LABELS[nextStatus]} →
          </Button>
        </div>
      )}
    </article>
  );
}

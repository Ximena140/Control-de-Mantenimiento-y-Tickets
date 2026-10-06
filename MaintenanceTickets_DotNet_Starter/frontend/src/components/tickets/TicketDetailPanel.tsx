import type { ReactNode } from 'react';
import type { Ticket } from '../../models/ticket';
import type { TicketHistoryEntry } from '../../models/ticketHistory';
import { formatDateTime } from '../../utils/formatDateTime';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { Modal } from '../ui/Modal';
import { Pill } from '../ui/Pill';
import { Spinner } from '../ui/Spinner';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import styles from './TicketDetailPanel.module.css';
import { TicketHistoryList } from './TicketHistoryList';
import { STATUS_TONES } from './ticketTones';

interface TicketDetailPanelProps {
  isOpen: boolean;
  ticket: Ticket | null;
  history: TicketHistoryEntry[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onClose: () => void;
}

export function TicketDetailPanel({ isOpen, ticket, history, isLoading, error, onRetry, onClose }: TicketDetailPanelProps) {
  return (
    <Modal isOpen={isOpen} title={ticket ? `Ticket #${ticket.id}` : 'Detalle del ticket'} onClose={onClose} size="large">
      {error && (
        <Alert
          variant="error"
          message={error}
          action={
            <Button variant="secondary" size="small" onClick={onRetry}>
              Reintentar
            </Button>
          }
        />
      )}
      {!ticket && isLoading && <Spinner label="Cargando ticket…" />}

      {ticket && (
        <div className={styles.content}>
          <div className={styles.heading}>
            <h3 className={styles.title}>{ticket.title}</h3>
            <div className={styles.badges}>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
          </div>

          <dl className={styles.details}>
            <DetailItem label="Equipo / activo">
              <Pill tone={STATUS_TONES[ticket.status] ?? 'neutral'}>{ticket.assetCode}</Pill>
            </DetailItem>
            <DetailItem label="Reportado por">{ticket.reportedBy}</DetailItem>
            <DetailItem label="Creado">{formatDateTime(ticket.createdAt)}</DetailItem>
            <DetailItem label="Última actualización">{formatDateTime(ticket.updatedAt)}</DetailItem>
            <DetailItem label="Descripción" wide>
              {ticket.description || 'Sin descripción'}
            </DetailItem>
            {ticket.diagnosis && (
              <DetailItem label="Diagnóstico" wide>
                {ticket.diagnosis}
              </DetailItem>
            )}
            {ticket.resolution && (
              <DetailItem label="Resolución" wide>
                {ticket.resolution}
              </DetailItem>
            )}
          </dl>

          <section className={styles.historySection} aria-labelledby="ticket-history-heading">
            <h3 id="ticket-history-heading" className={styles.sectionTitle}>
              Historial
            </h3>
            {isLoading ? (
              <Spinner label="Cargando historial…" />
            ) : history.length === 0 ? (
              <EmptyState message="Sin eventos registrados" />
            ) : (
              <TicketHistoryList entries={history} />
            )}
          </section>
        </div>
      )}
    </Modal>
  );
}

interface DetailItemProps {
  label: string;
  wide?: boolean;
  children: ReactNode;
}

function DetailItem({ label, wide = false, children }: DetailItemProps) {
  return (
    <div className={wide ? styles.wideItem : styles.item}>
      <dt className={styles.label}>{label}</dt>
      <dd className={styles.value}>{children}</dd>
    </div>
  );
}

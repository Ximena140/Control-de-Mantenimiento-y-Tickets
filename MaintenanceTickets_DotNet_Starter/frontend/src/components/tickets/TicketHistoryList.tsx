import { HISTORY_EVENT_LABELS, type TicketHistoryEntry } from '../../models/ticketHistory';
import { formatDateTime } from '../../utils/formatDateTime';
import { StatusBadge } from './StatusBadge';
import styles from './TicketHistoryList.module.css';

interface TicketHistoryListProps {
  entries: TicketHistoryEntry[];
}

/** Chronological timeline of the events returned by the API. */
export function TicketHistoryList({ entries }: TicketHistoryListProps) {
  return (
    <ol className={styles.timeline}>
      {entries.map((entry) => (
        <li key={entry.id} className={styles.entry}>
          <div className={styles.entryHeader}>
            <span className={styles.eventType}>{HISTORY_EVENT_LABELS[entry.eventType] ?? entry.eventType}</span>
            <time className={styles.date} dateTime={entry.createdAt}>
              {formatDateTime(entry.createdAt)}
            </time>
          </div>
          {entry.toStatus && (
            <p className={styles.statusChange}>
              {entry.fromStatus && (
                <>
                  <StatusBadge status={entry.fromStatus} />
                  <span aria-label="pasa a">→</span>
                </>
              )}
              <StatusBadge status={entry.toStatus} />
            </p>
          )}
          {entry.comment && <p className={styles.comment}>{entry.comment}</p>}
          <p className={styles.author}>Por {entry.performedBy}</p>
        </li>
      ))}
    </ol>
  );
}

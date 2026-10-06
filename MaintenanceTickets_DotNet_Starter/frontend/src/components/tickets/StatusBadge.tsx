import { TICKET_STATUS_LABELS, type TicketStatus } from '../../models/ticketStatus';
import { Pill } from '../ui/Pill';
import { STATUS_TONES } from './ticketTones';

interface StatusBadgeProps {
  status: TicketStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return <Pill tone={STATUS_TONES[status] ?? 'neutral'}>{TICKET_STATUS_LABELS[status] ?? status}</Pill>;
}

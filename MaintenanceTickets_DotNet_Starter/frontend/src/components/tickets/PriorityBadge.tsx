import { TICKET_PRIORITY_LABELS, type TicketPriority } from '../../models/ticketPriority';
import { Pill } from '../ui/Pill';
import { PRIORITY_TONES } from './ticketTones';

interface PriorityBadgeProps {
  priority: TicketPriority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return <Pill tone={PRIORITY_TONES[priority] ?? 'neutral'}>{TICKET_PRIORITY_LABELS[priority] ?? priority}</Pill>;
}

import { REQUIRED_TRANSITION_DETAIL, type TicketStatus } from '../models/ticketStatus';
import { removeEmptyErrors } from './validateText';

export interface StatusChangeFormValues {
  diagnosis: string;
  resolution: string;
  performedBy: string;
  comment: string;
}

export type StatusChangeFormErrors = Partial<Record<keyof StatusChangeFormValues, string>>;

/** Applies the backend requirements for entering `targetStatus`. */
export function validateStatusChange(values: StatusChangeFormValues, targetStatus: TicketStatus): StatusChangeFormErrors {
  const requiredDetail = REQUIRED_TRANSITION_DETAIL[targetStatus];
  return removeEmptyErrors({
    diagnosis:
      requiredDetail === 'diagnosis' && !values.diagnosis.trim()
        ? 'El diagnóstico es obligatorio para iniciar la atención.'
        : undefined,
    resolution:
      requiredDetail === 'resolution' && !values.resolution.trim()
        ? 'La resolución es obligatoria para marcar el ticket como resuelto.'
        : undefined,
    performedBy: values.performedBy.trim() ? undefined : 'Indica quién realiza el cambio.',
  });
}

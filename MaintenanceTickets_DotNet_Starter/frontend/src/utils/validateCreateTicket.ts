import type { TicketPriority } from '../models/ticketPriority';
import { TICKET_PRIORITIES } from '../models/ticketPriority';
import { CREATE_TICKET_LIMITS } from '../models/ticketValidationRules';
import { removeEmptyErrors, validateRequiredText } from './validateText';

export interface CreateTicketFormValues {
  title: string;
  assetCode: string;
  description: string;
  priority: TicketPriority | '';
  reportedBy: string;
}

export type CreateTicketFormErrors = Partial<Record<keyof CreateTicketFormValues, string>>;

/** Field order defines which invalid field receives focus first. */
export function validateCreateTicket(values: CreateTicketFormValues): CreateTicketFormErrors {
  const errors: CreateTicketFormErrors = {
    title: validateRequiredText(values.title, {
      fieldName: 'El título',
      requiredMessage: 'El título es obligatorio.',
      minLength: CREATE_TICKET_LIMITS.titleMinLength,
      maxLength: CREATE_TICKET_LIMITS.titleMaxLength,
    }),
    assetCode: validateRequiredText(values.assetCode, {
      fieldName: 'El equipo',
      requiredMessage: 'El equipo es obligatorio.',
      maxLength: CREATE_TICKET_LIMITS.assetCodeMaxLength,
    }),
    priority: isTicketPriority(values.priority) ? undefined : 'Selecciona una prioridad.',
    description: validateRequiredText(values.description, {
      fieldName: 'La descripción',
      requiredMessage: 'La descripción es obligatoria.',
      maxLength: CREATE_TICKET_LIMITS.descriptionMaxLength,
    }),
    reportedBy: validateRequiredText(values.reportedBy, {
      fieldName: 'El nombre de quien reporta',
      requiredMessage: 'Indica quién reporta la incidencia.',
      maxLength: CREATE_TICKET_LIMITS.reportedByMaxLength,
    }),
  };
  return removeEmptyErrors(errors);
}

function isTicketPriority(value: string): value is TicketPriority {
  return (TICKET_PRIORITIES as readonly string[]).includes(value);
}


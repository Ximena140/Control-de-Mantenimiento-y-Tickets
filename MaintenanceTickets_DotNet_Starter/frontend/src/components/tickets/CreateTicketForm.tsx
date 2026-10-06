import { useState } from 'react';
import { useForm } from '../../hooks/useForm';
import type { CreateTicketRequest, Ticket } from '../../models/ticket';
import { TICKET_PRIORITIES, TICKET_PRIORITY_LABELS, type TicketPriority } from '../../models/ticketPriority';
import { CREATE_TICKET_LIMITS } from '../../models/ticketValidationRules';
import type { OperationResult } from '../../utils/operationResult';
import { validateCreateTicket, type CreateTicketFormValues } from '../../utils/validateCreateTicket';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { SelectInput } from '../ui/SelectInput';
import { TextArea } from '../ui/TextArea';
import { TextInput } from '../ui/TextInput';
import styles from './CreateTicketForm.module.css';

const INITIAL_VALUES: CreateTicketFormValues = {
  title: '',
  assetCode: '',
  description: '',
  priority: '',
  reportedBy: '',
};

const PRIORITY_OPTIONS = TICKET_PRIORITIES.map((priority) => ({ value: priority, label: TICKET_PRIORITY_LABELS[priority] }));

interface CreateTicketFormProps {
  onSubmit: (request: CreateTicketRequest) => Promise<OperationResult<Ticket>>;
}

export function CreateTicketForm({ onSubmit }: CreateTicketFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm({
    initialValues: INITIAL_VALUES,
    validate: validateCreateTicket,
    onSubmit: async (values) => {
      setSubmitError(null);
      const result = await onSubmit({ ...values, priority: values.priority as TicketPriority });
      if (result.ok) {
        form.reset();
        return;
      }
      form.setServerErrors(result.error.fieldErrors);
      setSubmitError(result.error.message);
    },
  });

  return (
    <form className={styles.form} onSubmit={form.handleSubmit} noValidate>
      <TextInput
        name="title"
        label="Título"
        value={form.values.title}
        onChange={(value) => form.setFieldValue('title', value)}
        error={form.errors.title}
        maxLength={CREATE_TICKET_LIMITS.titleMaxLength}
        placeholder="Cajero fuera de servicio"
        required
      />
      <TextInput
        name="assetCode"
        label="Equipo / activo"
        value={form.values.assetCode}
        onChange={(value) => form.setFieldValue('assetCode', value)}
        error={form.errors.assetCode}
        placeholder="ATM-0451"
        required
      />
      <SelectInput
        name="priority"
        label="Prioridad"
        value={form.values.priority}
        options={PRIORITY_OPTIONS}
        onChange={(value) => form.setFieldValue('priority', value as TicketPriority)}
        placeholder="Selecciona una prioridad"
        error={form.errors.priority}
        required
      />
      <TextArea
        name="description"
        label="Descripción"
        value={form.values.description}
        onChange={(value) => form.setFieldValue('description', value)}
        error={form.errors.description}
        maxLength={CREATE_TICKET_LIMITS.descriptionMaxLength}
        placeholder="Pantalla sin respuesta..."
        required
      />
      <TextInput
        name="reportedBy"
        label="Reportado por"
        value={form.values.reportedBy}
        onChange={(value) => form.setFieldValue('reportedBy', value)}
        error={form.errors.reportedBy}
        placeholder="Nombre de quien reporta"
        autoComplete="name"
        required
      />

      {submitError && <Alert variant="error" message={submitError} onClose={() => setSubmitError(null)} />}

      <Button type="submit" fullWidth isLoading={form.isSubmitting} loadingText="Creando…">
        Crear ticket
      </Button>
    </form>
  );
}

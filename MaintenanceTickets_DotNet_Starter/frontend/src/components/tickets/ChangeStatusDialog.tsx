import { useState } from 'react';
import { useForm } from '../../hooks/useForm';
import type { ChangeTicketStatusRequest, Ticket } from '../../models/ticket';
import {
  REQUIRED_TRANSITION_DETAIL,
  TRANSITION_ACTION_LABELS,
  type TicketStatus,
  type TransitionDetailField,
} from '../../models/ticketStatus';
import type { OperationResult } from '../../utils/operationResult';
import { validateStatusChange, type StatusChangeFormValues } from '../../utils/validateStatusChange';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { TextArea } from '../ui/TextArea';
import { TextInput } from '../ui/TextInput';
import styles from './ChangeStatusDialog.module.css';
import { StatusBadge } from './StatusBadge';

const INITIAL_VALUES: StatusChangeFormValues = { diagnosis: '', resolution: '', performedBy: '', comment: '' };

const DETAIL_FIELD_LABELS: Record<TransitionDetailField, string> = {
  diagnosis: 'Diagnóstico',
  resolution: 'Resolución',
};

interface ChangeStatusDialogProps {
  ticket: Ticket;
  targetStatus: TicketStatus;
  onConfirm: (request: ChangeTicketStatusRequest) => Promise<OperationResult<Ticket>>;
  onCancel: () => void;
}

/** Collects exactly the data the API requires to move `ticket` into `targetStatus`. */
export function ChangeStatusDialog({ ticket, targetStatus, onConfirm, onCancel }: ChangeStatusDialogProps) {
  const requiredDetail = REQUIRED_TRANSITION_DETAIL[targetStatus];
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm({
    initialValues: INITIAL_VALUES,
    validate: (values) => validateStatusChange(values, targetStatus),
    onSubmit: async (values) => {
      setSubmitError(null);
      const result = await onConfirm({
        newStatus: targetStatus,
        diagnosis: requiredDetail === 'diagnosis' ? values.diagnosis : null,
        resolution: requiredDetail === 'resolution' ? values.resolution : null,
        performedBy: values.performedBy,
        comment: values.comment,
      });
      if (!result.ok) {
        form.setServerErrors(result.error.fieldErrors);
        setSubmitError(result.error.message);
      }
    },
  });

  return (
    <Modal isOpen title={TRANSITION_ACTION_LABELS[targetStatus] ?? 'Cambiar estado'} onClose={onCancel}>
      <div className={styles.summary}>
        <p className={styles.ticketName}>
          <span className={styles.ticketNumber}>#{ticket.id}</span> {ticket.title}
        </p>
        <p className={styles.transition}>
          <StatusBadge status={ticket.status} />
          <span aria-label="pasa a">→</span>
          <StatusBadge status={targetStatus} />
        </p>
      </div>

      <form className={styles.form} onSubmit={form.handleSubmit} noValidate>
        {requiredDetail && (
          <TextArea
            name={requiredDetail}
            label={DETAIL_FIELD_LABELS[requiredDetail]}
            value={form.values[requiredDetail]}
            onChange={(value) => form.setFieldValue(requiredDetail, value)}
            error={form.errors[requiredDetail]}
            required
          />
        )}
        <TextInput
          name="performedBy"
          label="Realizado por"
          value={form.values.performedBy}
          onChange={(value) => form.setFieldValue('performedBy', value)}
          error={form.errors.performedBy}
          placeholder="Nombre del operador"
          autoComplete="name"
          required
        />
        <TextArea
          name="comment"
          label="Comentario (opcional)"
          value={form.values.comment}
          onChange={(value) => form.setFieldValue('comment', value)}
          error={form.errors.comment}
          rows={2}
        />

        {submitError && <Alert variant="error" message={submitError} />}

        <div className={styles.actions}>
          <Button variant="secondary" onClick={onCancel} disabled={form.isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={form.isSubmitting} loadingText="Guardando…">
            Confirmar
          </Button>
        </div>
      </form>
    </Modal>
  );
}

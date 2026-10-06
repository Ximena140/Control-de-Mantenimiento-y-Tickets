import { useEffect, useState } from 'react';
import { AppHeader } from '../components/layout/AppHeader';
import { ChangeStatusDialog } from '../components/tickets/ChangeStatusDialog';
import { CreateTicketForm } from '../components/tickets/CreateTicketForm';
import { TicketBoard } from '../components/tickets/TicketBoard';
import { TicketDetailPanel } from '../components/tickets/TicketDetailPanel';
import { Alert } from '../components/ui/Alert';
import { useTicketDetail } from '../hooks/useTicketDetail';
import { useTickets } from '../hooks/useTickets';
import type { ChangeTicketStatusRequest, CreateTicketRequest, Ticket } from '../models/ticket';
import { getNextStatus, TICKET_STATUS_LABELS, type TicketStatus } from '../models/ticketStatus';
import type { OperationResult } from '../utils/operationResult';
import styles from './TicketsPage.module.css';

interface PendingTransition {
  ticket: Ticket;
  targetStatus: TicketStatus;
}

interface Notice {
  variant: 'success' | 'error';
  message: string;
}

const NOTICE_DURATION_MS = 5000;

/** Single screen of the app: create form, Kanban board, status-change dialog and ticket detail. */
export function TicketsPage() {
  const { tickets, isLoading, loadError, transitioningTicketId, reload, createTicket, changeStatus } = useTickets();
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [pendingTransition, setPendingTransition] = useState<PendingTransition | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const ticketDetail = useTicketDetail(selectedTicketId);

  useEffect(() => {
    if (!notice) {
      return;
    }
    const timeoutId = window.setTimeout(() => setNotice(null), NOTICE_DURATION_MS);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  // The selected ticket no longer exists: close the detail and resynchronize the board.
  const detailNotFound = ticketDetail.error?.status === 404;
  useEffect(() => {
    if (detailNotFound) {
      setSelectedTicketId(null);
      setNotice({ variant: 'error', message: 'El ticket no existe o ya no está disponible.' });
      void reload();
    }
  }, [detailNotFound, reload]);

  async function handleCreateTicket(request: CreateTicketRequest): Promise<OperationResult<Ticket>> {
    const result = await createTicket(request);
    if (result.ok) {
      setNotice({ variant: 'success', message: `Ticket #${result.data.id} creado correctamente.` });
    }
    return result;
  }

  function handleRequestTransition(ticket: Ticket) {
    const targetStatus = getNextStatus(ticket.status);
    if (targetStatus) {
      setPendingTransition({ ticket, targetStatus });
    }
  }

  async function handleConfirmTransition(transition: PendingTransition, request: ChangeTicketStatusRequest): Promise<OperationResult<Ticket>> {
    const result = await changeStatus(transition.ticket, request);
    if (result.ok) {
      setPendingTransition(null);
      setNotice({
        variant: 'success',
        message: `Ticket #${result.data.id} movido a ${TICKET_STATUS_LABELS[result.data.status]}.`,
      });
      if (selectedTicketId === result.data.id) {
        ticketDetail.reload();
      }
    } else if (result.error.status === 404) {
      setPendingTransition(null);
      setNotice({ variant: 'error', message: result.error.message });
    }
    return result;
  }

  return (
    <div className={styles.page}>
      <AppHeader />

      <main className={styles.main}>
        <aside className={styles.formPanel} aria-labelledby="create-ticket-heading">
          <h2 id="create-ticket-heading" className={styles.panelTitle}>
            Nuevo ticket
          </h2>
          <CreateTicketForm onSubmit={handleCreateTicket} />
        </aside>

        <section className={styles.boardArea} aria-labelledby="board-heading">
          <h2 id="board-heading" className="visually-hidden">
            Tablero de tickets
          </h2>
          <TicketBoard
            tickets={tickets}
            isLoading={isLoading}
            loadError={loadError}
            transitioningTicketId={transitioningTicketId}
            onRetry={() => void reload()}
            onSelectTicket={setSelectedTicketId}
            onRequestTransition={handleRequestTransition}
          />
        </section>
      </main>

      {notice && (
        <div className={styles.notice}>
          <Alert variant={notice.variant} message={notice.message} onClose={() => setNotice(null)} />
        </div>
      )}

      {pendingTransition && (
        <ChangeStatusDialog
          key={`${pendingTransition.ticket.id}-${pendingTransition.targetStatus}`}
          ticket={pendingTransition.ticket}
          targetStatus={pendingTransition.targetStatus}
          onConfirm={(request) => handleConfirmTransition(pendingTransition, request)}
          onCancel={() => setPendingTransition(null)}
        />
      )}

      <TicketDetailPanel
        isOpen={selectedTicketId !== null}
        ticket={ticketDetail.ticket}
        history={ticketDetail.history}
        isLoading={ticketDetail.isLoading}
        error={detailNotFound ? null : (ticketDetail.error?.message ?? null)}
        onRetry={ticketDetail.reload}
        onClose={() => setSelectedTicketId(null)}
      />
    </div>
  );
}

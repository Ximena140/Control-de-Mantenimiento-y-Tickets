import { useCallback, useEffect, useState } from 'react';
import type { Ticket } from '../models/ticket';
import type { TicketHistoryEntry } from '../models/ticketHistory';
import { ticketService } from '../services/ticketService';
import { toOperationFailure, type OperationFailure } from '../utils/operationResult';

/** Loads the latest data and history of the selected ticket. Pass null when no ticket is selected. */
export function useTicketDetail(ticketId: number | null) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [history, setHistory] = useState<TicketHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<OperationFailure | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    // Keep showing the current data while reloading the same ticket; clear it when the ticket changes.
    setTicket((current) => (current?.id === ticketId ? current : null));
    setHistory((current) => (current[0]?.ticketId === ticketId ? current : []));
    setError(null);

    if (ticketId === null) {
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    Promise.all([
      ticketService.getTicketById(ticketId, controller.signal),
      ticketService.getTicketHistory(ticketId, controller.signal),
    ])
      .then(([loadedTicket, entries]) => {
        if (!controller.signal.aborted) {
          setTicket(loadedTicket);
          setHistory(entries);
        }
      })
      .catch((loadError: unknown) => {
        if (!controller.signal.aborted) {
          setError(toOperationFailure(loadError));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [ticketId, reloadCount]);

  const reload = useCallback(() => setReloadCount((count) => count + 1), []);

  return { ticket, history, isLoading, error, reload };
}

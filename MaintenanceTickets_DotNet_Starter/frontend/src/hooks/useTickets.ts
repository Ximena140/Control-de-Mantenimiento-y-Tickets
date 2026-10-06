import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import type { ChangeTicketStatusRequest, CreateTicketRequest, Ticket } from '../models/ticket';
import { canTransition } from '../models/ticketStatus';
import { ticketService } from '../services/ticketService';
import { getErrorMessage } from '../utils/getErrorMessage';
import { toOperationFailure, type OperationResult } from '../utils/operationResult';

interface TicketsState {
  tickets: Ticket[];
  isLoading: boolean;
  loadError: string | null;
}

type TicketsAction =
  | { type: 'loadStarted' }
  | { type: 'loadSucceeded'; tickets: Ticket[] }
  | { type: 'loadFailed'; message: string }
  | { type: 'ticketCreated'; ticket: Ticket }
  | { type: 'ticketUpdated'; ticket: Ticket };

const INITIAL_STATE: TicketsState = { tickets: [], isLoading: true, loadError: null };

function ticketsReducer(state: TicketsState, action: TicketsAction): TicketsState {
  switch (action.type) {
    case 'loadStarted':
      return { ...state, isLoading: true, loadError: null };
    case 'loadSucceeded':
      return { tickets: action.tickets, isLoading: false, loadError: null };
    case 'loadFailed':
      return { ...state, isLoading: false, loadError: action.message };
    case 'ticketCreated':
      return { ...state, tickets: [action.ticket, ...state.tickets.filter((ticket) => ticket.id !== action.ticket.id)] };
    case 'ticketUpdated':
      return { ...state, tickets: state.tickets.map((ticket) => (ticket.id === action.ticket.id ? action.ticket : ticket)) };
  }
}

/** Ticket list state plus the operations that change it. The UI only reflects what the API confirms. */
export function useTickets() {
  const [state, dispatch] = useReducer(ticketsReducer, INITIAL_STATE);
  const [transitioningTicketId, setTransitioningTicketId] = useState<number | null>(null);
  const loadControllerRef = useRef<AbortController | null>(null);

  const reload = useCallback(async () => {
    loadControllerRef.current?.abort();
    const controller = new AbortController();
    loadControllerRef.current = controller;

    dispatch({ type: 'loadStarted' });
    try {
      const tickets = await ticketService.getTickets(controller.signal);
      if (!controller.signal.aborted) {
        dispatch({ type: 'loadSucceeded', tickets });
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        dispatch({ type: 'loadFailed', message: getErrorMessage(error) });
      }
    }
  }, []);

  useEffect(() => {
    void reload();
    return () => loadControllerRef.current?.abort();
  }, [reload]);

  const createTicket = useCallback(async (request: CreateTicketRequest): Promise<OperationResult<Ticket>> => {
    try {
      const ticket = await ticketService.createTicket(request);
      dispatch({ type: 'ticketCreated', ticket });
      return { ok: true, data: ticket };
    } catch (error) {
      return { ok: false, error: toOperationFailure(error) };
    }
  }, []);

  const changeStatus = useCallback(
    async (ticket: Ticket, request: ChangeTicketStatusRequest): Promise<OperationResult<Ticket>> => {
      if (!canTransition(ticket.status, request.newStatus)) {
        return {
          ok: false,
          error: { status: null, message: 'Este cambio de estado no está permitido.', fieldErrors: {} },
        };
      }

      setTransitioningTicketId(ticket.id);
      try {
        const updatedTicket = await ticketService.changeTicketStatus(ticket.id, request);
        dispatch({ type: 'ticketUpdated', ticket: updatedTicket });
        return { ok: true, data: updatedTicket };
      } catch (error) {
        const failure = toOperationFailure(error);
        // 404/409 mean the board is out of date (ticket deleted or moved elsewhere): resynchronize it.
        if (failure.status === 404 || failure.status === 409) {
          void reload();
        }
        return { ok: false, error: failure };
      } finally {
        setTransitioningTicketId(null);
      }
    },
    [reload],
  );

  return { ...state, transitioningTicketId, reload, createTicket, changeStatus };
}

# Maintenance Tickets — Web (React)

Web client for the **MaintenanceTickets API**. Users report maintenance incidents (ATMs, facilities, equipment) and operators move each ticket through the backend state machine on a Kanban board, with a full history per ticket.

UI texts are in Spanish; code, files and types are in English.

## Features

- **Create ticket**: title, asset, priority, description and reporter, validated on the client against the API contract before sending.
- **Kanban board**: *Pendiente*, *En Proceso* and *Resuelto* columns, filled from `GET /api/tickets`.
- **State machine**: each card offers only the next valid transition (`PENDING → IN_PROGRESS → RESOLVED`). The dialog asks for exactly what the API requires: a diagnosis to start work, a resolution to resolve, and always who performs the change.
- **Traceability**: clicking a card opens its detail and the history from `GET /api/tickets/{id}/history`.
- **Error handling**: validation errors next to each field, business-rule rejections (`409`), missing tickets (`404`), server errors (`5xx`) and an unreachable API.

## Stack

React 18 · TypeScript (strict) · Vite 7 · CSS Modules. No other runtime dependencies: HTTP uses the native `fetch` API and state uses React hooks.

## Requirements

- Node.js 20.19+ (LTS recommended)
- The MaintenanceTickets API running (see the backend README)
- For local HTTPS, a trusted .NET development certificate:

  ```bash
  dotnet dev-certs https --trust
  ```

## Getting started

```bash
cd frontend
npm install
cp .env.example .env.local   # adjust VITE_API_BASE_URL if needed
npm run dev
```

The app runs at http://localhost:5173.

| Script | Description |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Type-checks and builds static files into `dist/` |
| `npm run preview` | Serves the production build locally |
| `npm run typecheck` | Type-checks without building |

## Configuration

| Variable | Description | Example |
|---|---|---|
| `VITE_API_BASE_URL` | Backend base URL, without a trailing slash | `https://localhost:5001` |

- The value is read only in `src/config/apiConfig.ts`.
- In development, the app falls back to `https://localhost:5001` if the variable is missing.
- A production build without the variable shows a configuration error instead of silently calling `localhost`.
- `VITE_*` variables are embedded in the public bundle: never put secrets in them.

## API endpoints used

| Purpose | Method | Endpoint | Success | Handled errors |
|---|---|---|---|---|
| List tickets | GET | `/api/tickets` | 200 | 5xx, network |
| Create ticket | POST | `/api/tickets` | 201 | 400 (field errors or business rule), 5xx, network |
| Get ticket | GET | `/api/tickets/{id}` | 200 | 404, 5xx, network |
| Change status | PUT | `/api/tickets/{id}/status` | 200 | 400, 404, 409, 5xx, network |
| Ticket history | GET | `/api/tickets/{id}/history` | 200 | 5xx, network |

## Project structure

```
src/
├── config/        apiConfig.ts — the only place that reads environment variables
├── models/        API models (Ticket, TicketHistoryEntry, requests) and domain constants:
│                  statuses, transitions, priorities, validation limits
├── services/      httpClient (fetch + error normalization), ApiError, ticketService (all endpoints)
├── hooks/         useTickets (board state and operations), useTicketDetail (detail + history),
│                  useForm (controlled forms with validation)
├── utils/         pure helpers: validators, error messages, operation results, date formatting
├── components/
│   ├── ui/        generic, reusable controls (Button, FormField, inputs, Pill, Alert, Modal…)
│   ├── layout/    AppHeader
│   └── tickets/   domain components (CreateTicketForm, TicketBoard, TicketColumn, TicketCard,
│                  ChangeStatusDialog, TicketDetailPanel, TicketHistoryList, badges)
├── pages/         TicketsPage — composes the screen and coordinates the flows
└── styles/        global.css — design tokens and base styles
```

Dependency rule: `components → hooks → services → config`, with `models` and `utils` shared. Components never call `fetch` and never know URLs.

## Main flows

**Create ticket**

`User → CreateTicketForm → useTickets.createTicket → ticketService.createTicket → POST /api/tickets → API → SQL Server (Tickets + TicketHistory "CREATED")`

**Change status**

`Operator → TicketCard → ChangeStatusDialog → useTickets.changeStatus → ticketService.changeTicketStatus → PUT /api/tickets/{id}/status → API state machine → sp_TransitionTicketStatus (update + TicketHistory "STATUS_CHANGED")`

**View history**

`User → TicketCard → TicketDetailPanel → useTicketDetail → GET /api/tickets/{id} + GET /api/tickets/{id}/history`

The backend is the source of truth for transitions. The UI mirrors them in `models/ticketStatus.ts` only to hide invalid actions. If the API rejects a change (`409`), the message is shown and the board is reloaded.

## Deployment

1. Deploy the API with a public **HTTPS** URL. An HTTPS page cannot call `localhost` or plain HTTP.
2. In the static hosting provider (Azure Static Web Apps, Netlify, Vercel…), set `VITE_API_BASE_URL` to that URL.
3. Build with `npm run build` and publish the `dist/` folder. No rewrite rules are needed: the app has a single route.

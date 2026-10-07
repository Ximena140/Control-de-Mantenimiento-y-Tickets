# AI-Assisted Development — Prompts

This document lists the main prompts used with an AI coding assistant to build the frontend.
Each prompt defines context, constraints, deliverables and acceptance criteria, so the assistant
works against the real backend contract instead of guessing.

---

## 1. Frontend — Analysis and implementation plan

> **Goal:** get a reviewed plan before writing any code.

```text
Role: You are a senior frontend engineer working on an existing maintenance-ticket system.

Context:
- Backend: ASP.NET Core 8 Web API + SQL Server, documented with Swagger at
  https://localhost:5001/swagger/index.html.
- Business flow: a user reports an incident → a ticket is created as PENDING → an operator
  moves it to IN_PROGRESS → then to RESOLVED. Every change must be traceable in its history.

Task:
Analyze the Swagger contract and produce FRONTEND_PLAN.md for a React frontend.
Do NOT write application code yet.

The plan must include:
1. Endpoint table (method, route, request, response, real HTTP status codes).
2. State machine and business rules as enforced by the backend.
3. Validation rules (title ≤ 150, description ≤ 2000, asset and priority required),
   aligned with the DTO constraints.
4. Architecture and folder structure (components, pages, services, models, hooks, utils, config).
5. State management strategy using plain React (no global state library unless justified).
6. Error handling for 400, 404, 409, 500 and network failures.
7. Environment variables required for deployment.
8. Open questions and inconsistencies between these requirements and Swagger.

Constraints:
- Use only endpoints, fields, statuses and priorities that exist in the API. Never invent them.
- If Swagger is missing information, list it as an open question instead of assuming.
- No authentication, pagination, filters, drag and drop or local storage.
- Code, file names and identifiers in English; UI text in Spanish.

Acceptance criteria:
- Every endpoint and field in the plan can be traced to Swagger or to the backend code.
- The plan maps each item to the evaluation criteria (R2.1–R2.12).
```

---

## 2. Frontend — Implementation from the approved plan

> **Goal:** implement the plan and match the provided UI mockup.

```text
Implement the frontend defined in FRONTEND_PLAN.md (approved with the default answers to all
open questions). Match the attached mockup: branded header, "Nuevo ticket" side panel with an
orange primary button, and a three-column Kanban board (Pendiente, En Proceso, Resuelto) with
colored status pills.

Technical requirements:
- React 18 + TypeScript (strict) + Vite + CSS Modules. No extra runtime dependencies.
- API access isolated in services/ (httpClient + ticketService); the base URL comes only from
  VITE_API_BASE_URL.
- Each card offers only the next valid transition. Validate it again before calling the API,
  and treat the backend as the final authority (handle 409 by showing the message and
  reloading the board).
- The status-change dialog asks exactly for what the API requires: diagnosis (→ IN_PROGRESS),
  resolution (→ RESOLVED), performedBy, and an optional comment.
- Ticket detail shows the history from GET /api/tickets/{id}/history.
- Accessible forms: associated labels, aria-invalid, focus on the first invalid field.

Verification:
- Build with `npm run build` without type errors.
- Test every flow against the real API: create, validation errors, both transitions,
  rejected transition (409), detail with history, and backend unavailable.
- Check the layout at desktop and mobile widths.
```

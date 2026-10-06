# FRONTEND_PLAN.md — Maintenance Tickets Web (React)

> **Estado:** aprobado con las propuestas por defecto (Q1–Q17) e **implementado** en `frontend/`, siguiendo el diseño del mockup entregado (encabezado de marca, panel lateral "Nuevo ticket" y tres columnas con etiquetas de color).
>
> **Diferencias respecto del plan original:**
> - `useTicketDetail` pasó a llamarse `useTicketDetail`: carga el ticket (`GET /{id}`) y su historial en paralelo.
> - Se agregaron `components/layout/AppHeader`, `components/ui/Pill`, `components/tickets/ticketTones.ts`, `utils/validateText.ts` y `utils/operationResult.ts`.
> - Para respetar el mockup, la tarjeta muestra solo `#id`, título y una etiqueta del equipo con el color de la columna, más la acción de la siguiente transición. La prioridad, el autor, las fechas, el diagnóstico y la resolución se muestran en el detalle.
> - El encabezado muestra "Operador" como texto estático: no hay autenticación.
> - La etiqueta de estado es "En Proceso", como en el diseño.
> - Versiones: React 18.3, Vite 7 y TypeScript 5.9.
>
> **Refactor posterior del backend:**
> - Se eliminó el estado `CLOSED`; el flujo termina en `RESOLVED`. Esto vuelve obsoletos F6 y Q6, y `TicketStatus` ya no incluye `CLOSED`.
> - Las respuestas ya no incluyen `history` ni `ticket` (F9 resuelto).
> - El análisis de las secciones 6 a 9 se conserva como registro de la situación original.
> **Fuente del contrato:** `https://localhost:5001/swagger/v1/swagger.json` (OpenAPI 3.0.1, `MaintenanceTickets.Api v1`), leído directamente de la API en ejecución el 2026-10-04. Las respuestas se verificaron llamando a la API real.

## Convención de origen de la información

El Swagger documenta **rutas, métodos, parámetros y esquemas de request**, pero **no documenta**:

- los cuerpos de respuesta (todas las operaciones aparecen como `200 OK` sin esquema);
- los códigos de error;
- los valores permitidos de estado y prioridad (son `string` libres).

Para no inventar nada, cada dato se etiqueta así:

| Etiqueta | Significado |
|---|---|
| **[Swagger]** | Documentado en `swagger.json`. Se usa tal cual. |
| **[API real]** | No figura en Swagger, pero se verificó con respuestas reales de la API o con el código del backend (controller, service, DTOs y stored procedure). **Requiere tu confirmación** antes de usarlo (pregunta Q9). |
| **[Propuesta]** | Decisión de diseño del frontend, pendiente de tu aprobación. |

---

## 1. Contexto de negocio

El negocio necesita digitalizar los reportes de mantenimiento: cajeros automáticos, infraestructura física y otros equipos.

1. Un usuario detecta una incidencia y **registra un ticket**.
2. El ticket nace en estado **pendiente**.
3. Un **operador** lo gestiona: diagnostica, trabaja y resuelve.
4. El ticket avanza solo por los estados permitidos hasta quedar **resuelto**.
5. Cada evento queda registrado en un **historial** persistido (trazabilidad).

El backend (ASP.NET Core 8 + SQL Server) ya implementa este flujo. Organiza el código en capas (Controller → Service → Repository) y ejecuta la transición de estado y el registro en el historial dentro de una transacción del stored procedure `sp_TransitionTicketStatus`.

## 2. Objetivo del frontend

Ofrecer una interfaz web en React que permita:

- **registrar** tickets;
- **visualizar** su estado en un tablero Kanban;
- **avanzar** su estado únicamente por transiciones válidas;
- **consultar** su historial.

Todo ello comunicándose **solo** con la API REST del backend.

## 3. Alcance

**Incluido**

- Formulario de creación de ticket con validaciones.
- Tablero Kanban con tres columnas: Pendiente, En proceso y Resuelto.
- Acción de cambio de estado limitada a la siguiente transición válida, con captura de los datos que exige la API.
- Panel de detalle del ticket con su historial.
- Estados de interfaz: carga, éxito, error, formulario inválido, lista vacía y operación en progreso.
- Configuración por variables de entorno, preparada para despliegue.
- README y `.gitignore` del frontend.

**Excluido** (explícitamente, por los requerimientos)

- Autenticación, login, usuarios y roles.
- Paginación, filtros, búsqueda y ordenamiento.
- Drag and drop.
- Dashboards, estadísticas y notificaciones push.
- LocalStorage o cualquier persistencia local.
- Datos mock permanentes.
- Edición y eliminación de tickets (no existen endpoints).
- Acceso directo a la base de datos o a stored procedures.
- El despliegue en sí (solo se deja preparado).

## 4. Requerimientos funcionales

| ID | Requerimiento | Endpoint |
|---|---|---|
| FR-1 | Crear un ticket con Título, Equipo, Descripción y Prioridad (todos obligatorios en la UI). | `POST /api/tickets` |
| FR-2 | Validar el formulario en el cliente, mostrar errores junto a cada campo y bloquear el envío si hay errores. | — |
| FR-3 | Mostrar los errores de validación y de negocio que devuelva la API. | — |
| FR-4 | Listar los tickets y ubicarlos en la columna que corresponde a su `status`. | `GET /api/tickets` |
| FR-5 | Ofrecer en cada tarjeta solo la acción de la siguiente transición válida. | — |
| FR-6 | Ejecutar la transición mediante la API y actualizar la interfaz con la respuesta. | `PUT /api/tickets/{id}/status` |
| FR-7 | Manejar y mostrar el rechazo de una transición por parte del backend. | — |
| FR-8 | Consultar y mostrar el historial de un ticket. | `GET /api/tickets/{id}/history` |

## 5. Relación con los criterios R2.1 a R2.12

| Criterio | Cómo lo aborda el frontend | Secciones |
|---|---|---|
| **R2.1 Frontend** | `CreateTicketForm` + `TicketBoard` (Kanban de tres columnas). | 13, 18, 19 |
| **R2.2 Máquina de estados** | Una sola tabla de transiciones (`ticketStatusTransitions`) que refleja la del backend; la UI solo muestra la acción permitida. | 7 |
| **R2.3 Lógica de negocio** | Nunca se ofrece Pendiente → Resuelto; la transición se revalida antes de llamar a la API y los rechazos (`409`) se muestran y resincronizan el tablero. | 7, 20, 22 |
| **R2.4 Base de datos** | Sin acceso directo. El modelo `TicketHistoryEntry` refleja la relación 1 → N; el historial se consulta por ticket. | 16, 21 |
| **R2.5 Stored procedures** | Se usan indirectamente a través de `PUT /api/tickets/{id}/status`. El frontend no los conoce. | 20 |
| **R2.6 Trazabilidad** | `TicketDetailPanel` muestra los eventos de `GET /api/tickets/{id}/history`: tipo, estado anterior, estado nuevo, comentario, autor y fecha. | 21 |
| **R2.7 Arquitectura** | Capas: config → http client → services → hooks → components y pages. Sin `fetch` en los componentes. | 11–15 |
| **R2.8 Secuencias** | Cada flujo tiene una cadena de llamadas fija y nombrada (Component → Hook → Service → httpClient → API). | 18–21 |
| **R2.9 Estructura de datos** | Modelos `Ticket`, `TicketHistoryEntry`, `CreateTicketRequest` y `ChangeTicketStatusRequest`, copiados del contrato real. | 16 |
| **R2.10 Despliegue** | `VITE_API_BASE_URL`, `npm run build` genera estáticos desplegables y no hay rutas de servidor. | 23, 25 |
| **R2.11 Código fuente** | Carpeta `frontend/` en el mismo repositorio, `.gitignore` propio y sin secretos. | 26 |
| **R2.12 Documentación e inglés** | Código, archivos, tipos y componentes en inglés; textos de UI en español; README del frontend. | 24, 27 |

## 6. Reglas de negocio

Todas provienen del backend; el frontend no añade ninguna.

| # | Regla | Origen |
|---|---|---|
| BR-1 | Un ticket nuevo siempre inicia en `PENDING`. El request de creación no tiene campo de estado. | [Swagger] `CreateTicketDto` / [API real] |
| BR-2 | Transiciones permitidas: `PENDING → IN_PROGRESS`, `IN_PROGRESS → RESOLVED` y `RESOLVED → CLOSED`. Cualquier otra se rechaza. | [API real] `TicketService` y `sp_TransitionTicketStatus` |
| BR-3 | Para pasar a `IN_PROGRESS` es obligatorio un `diagnosis` no vacío. | [API real] |
| BR-4 | Para pasar a `RESOLVED` es obligatoria una `resolution` no vacía. | [API real] |
| BR-5 | Toda transición exige `performedBy`. | [Swagger] `ChangeStatusDto.required` |
| BR-6 | Toda creación exige `reportedBy`. | [Swagger] `CreateTicketDto.required` |
| BR-7 | La prioridad debe ser `LOW`, `MEDIUM`, `HIGH` o `CRITICAL`; el backend la normaliza a mayúsculas. | [API real] (mensaje de error y `CHECK` de la tabla) |
| BR-8 | La creación registra el evento `CREATED` en el historial y cada transición registra `STATUS_CHANGED`. | [API real] |

## 7. Máquina de estados

```
            diagnosis + performedBy        resolution + performedBy        performedBy
 PENDING ───────────────────────────▶ IN_PROGRESS ─────────────────────────▶ RESOLVED ─────────────▶ CLOSED
 "Pendiente"                         "En proceso"                          "Resuelto"              (fuera del Kanban, ver Q6)

 ✗ PENDING → RESOLVED   ✗ cualquier retroceso   ✗ saltos
```

**Fuente de verdad.** La API **no expone** un endpoint que liste las transiciones permitidas. Para mostrar solo las acciones válidas (R2.3), el frontend necesita conocerlas. **[Propuesta, ver Q10]:**

- Reflejar las transiciones del backend en **un único archivo**, `models/ticketStatus.ts`, con comentarios que indiquen que replican `TicketService.ChangeStatusAsync`.
- La UI consulta `getNextStatus(status)` para decidir qué botón mostrar.
- El hook revalida con `canTransition(from, to)` antes de llamar a la API.
- El backend sigue siendo la autoridad final: si responde `409`, el frontend muestra su mensaje y recarga el tablero.

Acción visible en cada columna:

| Columna | Estado | Acción visible | Datos que pide |
|---|---|---|---|
| Pendiente | `PENDING` | "Iniciar atención" → `IN_PROGRESS` | Diagnóstico*, Realizado por*, Comentario |
| En proceso | `IN_PROGRESS` | "Marcar como resuelto" → `RESOLVED` | Resolución*, Realizado por*, Comentario |
| Resuelto | `RESOLVED` | Ninguna (ver Q6) | — |

\* obligatorio según el backend.

## 8. Validaciones

### 8.1 Crear ticket

| Campo UI | Campo API | Tu requerimiento | Swagger | Regla propuesta |
|---|---|---|---|---|
| Título | `title` | Obligatorio, máx. 150 | required, **minLength 3**, maxLength 150 | Obligatorio, 3–150 (ver Q2) |
| Equipo | `assetCode` | Obligatorio | required, minLength 1, **maxLength 30** | Obligatorio, máx. 30 (ver Q1) |
| Descripción | `description` | Obligatoria, máx. 2000 | **nullable** (opcional), maxLength 2000 | Obligatoria, máx. 2000 (ver Q3) |
| Prioridad | `priority` | Obligatoria | required, string sin enum | Obligatoria, selección entre 4 valores (ver Q4) |
| Reportado por | `reportedBy` | *No mencionado* | required, minLength 1, maxLength 100 | Obligatorio, máx. 100 (ver Q5) |

### 8.2 Cambiar estado

| Campo UI | Campo API | Swagger | Regla propuesta |
|---|---|---|---|
| — | `newStatus` | required | Lo asigna la aplicación según la transición; no lo escribe el usuario. |
| Diagnóstico | `diagnosis` | nullable | Obligatorio solo si el destino es `IN_PROGRESS` (BR-3). |
| Resolución | `resolution` | nullable | Obligatoria solo si el destino es `RESOLVED` (BR-4). |
| Realizado por | `performedBy` | required | Obligatorio (ver Q5). |
| Comentario | `comment` | nullable | Opcional. |

Swagger no define longitudes máximas para estos campos (ver Q8).

### 8.3 Comportamiento común

- Un valor que solo contiene espacios se considera vacío, igual que en el backend (`IsNullOrWhiteSpace`, `NULLIF(LTRIM(RTRIM()))`).
- Se valida al enviar y, después del primer intento, al editar cada campo.
- El botón de enviar no dispara la petición mientras existan errores.
- Se muestran contadores de caracteres en los campos con máximo.
- Los errores `400` de la API se asignan al campo correspondiente; si no corresponden a ningún campo, se muestran como mensaje general.
- Los límites se definen una sola vez, en `models/ticketValidationRules.ts`.

## 9. Análisis de Swagger

### 9.1 Inventario

Swagger expone 4 rutas y 5 operaciones, todas bajo el tag `Tickets`, **sin esquemas de seguridad**.

| Método | Ruta | Parámetros | Request body | Response en Swagger |
|---|---|---|---|---|
| GET | `/api/tickets` | — | — | `200` sin esquema |
| POST | `/api/tickets` | — | `CreateTicketDto` | `200` sin esquema |
| GET | `/api/tickets/{id}` | `id`: path, int32, requerido | — | `200` sin esquema |
| PUT | `/api/tickets/{id}/status` | `id`: path, int32, requerido | `ChangeStatusDto` | `200` sin esquema |
| GET | `/api/tickets/{id}/history` | `id`: path, int32, requerido | — | `200` sin esquema |

Ambos DTO tienen `additionalProperties: false`, así que no se pueden enviar campos extra.

### 9.2 Respuestas reales [API real]

**Ticket** (lo devuelven `GET /api/tickets`, `GET /api/tickets/{id}`, `POST` y `PUT`):

```json
{
  "id": 1000,
  "title": "ATM screen is not working",
  "assetCode": "ATM-0451",
  "description": "The screen remains black.",
  "priority": "HIGH",
  "status": "IN_PROGRESS",
  "diagnosis": "Power supply failure detected.",
  "resolution": null,
  "reportedBy": "Ximena",
  "createdAt": "2026-10-05T00:32:42.4513276",
  "updatedAt": "2026-10-05T00:34:24.0344512",
  "history": []
}
```

**Historial** (`GET /api/tickets/{id}/history`, ordenado por `createdAt` ascendente):

```json
[
  { "id": 1, "ticketId": 1000, "eventType": "CREATED", "fromStatus": null, "toStatus": "PENDING",
    "comment": "Ticket created", "performedBy": "Ximena", "createdAt": "2026-10-05T00:32:44.0389536", "ticket": null },
  { "id": 2, "ticketId": 1000, "eventType": "STATUS_CHANGED", "fromStatus": "PENDING", "toStatus": "IN_PROGRESS",
    "comment": "Diagnosis completed.", "performedBy": "Operator 1", "createdAt": "2026-10-05T00:34:24.0424924", "ticket": null }
]
```

### 9.3 Códigos HTTP reales [API real]

| Endpoint | Éxito | Errores |
|---|---|---|
| `GET /api/tickets` | `200` | `500` |
| `POST /api/tickets` | **`201`** (Swagger dice 200) + cabecera `Location` | `400` con *ProblemDetails* (`errors` por campo); `400` con `{ "message" }` (prioridad inválida); `500` |
| `GET /api/tickets/{id}` | `200` | `404` sin cuerpo; `500` |
| `PUT /api/tickets/{id}/status` | `200` | `400` con *ProblemDetails*; `404` sin cuerpo; **`409`** con `{ "message" }` (transición inválida o falta diagnóstico/resolución); `500` |
| `GET /api/tickets/{id}/history` | `200` (si el ticket no existe, devuelve `[]` y **no** `404`) | `500` |

Además, si el backend no está disponible, `fetch` lanza un error de red sin código HTTP.

### 9.4 Hallazgos e inconsistencias

| # | Hallazgo | Impacto | Pregunta |
|---|---|---|---|
| F1 | "Equipo" no existe como campo; el equivalente es `assetCode` (máx. 30). | Nombre y límite del campo | Q1 |
| F2 | Swagger exige un **mínimo de 3** caracteres en `title`. | Validación adicional | Q2 |
| F3 | `description` es **opcional** en la API y obligatoria en tu requerimiento. | Regla más estricta en la UI | Q3 |
| F4 | La prioridad no tiene enum en Swagger. | Opciones del selector | Q4 |
| F5 | `reportedBy` y `performedBy` son obligatorios, pero no se pueden inventar usuarios ni login. | Campos de texto extra | Q5 |
| F6 | Existe un cuarto estado, `CLOSED`, y la transición `RESOLVED → CLOSED`; el Kanban tiene tres columnas. | Tickets que no aparecerían en el tablero | Q6 |
| F7 | Las transiciones exigen datos adicionales (`diagnosis`, `resolution` y `performedBy`; `comment` es opcional). | Diálogo de transición | Q7 |
| F8 | Swagger no documenta respuestas ni códigos de error. | Uso del comportamiento real | Q9 |
| F9 | `GET /api/tickets` devuelve **siempre `history: []`**, porque el backend no carga la relación en el listado. | El historial debe pedirse a su propio endpoint; nunca leer `ticket.history` del listado. | — |
| F10 | **Fechas:** los GET devuelven fechas **sin zona horaria** (`"2026-10-05T00:32:42.45"`), mientras que el POST las devuelve con `Z`. Son UTC (`SYSUTCDATETIME`), pero el navegador interpretaría las primeras como hora local, con un desfase de varias horas. | Formateo de fechas | Q11 |
| F11 | Los mensajes de error del backend están en inglés. | Textos visibles | Q13 |
| F12 | No hay endpoint que exponga la máquina de estados. | Hay que reflejarla en el frontend | Q10 |

## 10. Endpoints que utilizará el frontend

| Purpose | HTTP Method | Endpoint | Request | Response |
|---|---|---|---|---|
| Listar tickets (tablero) | GET | `/api/tickets` | — | `200` `Ticket[]` (más recientes primero) |
| Crear ticket | POST | `/api/tickets` | `CreateTicketDto` `{ title, assetCode, description, priority, reportedBy }` | `201` `Ticket` · `400` · `500` |
| Cambiar estado | PUT | `/api/tickets/{id}/status` | `ChangeStatusDto` `{ newStatus, diagnosis, resolution, performedBy, comment }` | `200` `Ticket` · `400` · `404` · `409` · `500` |
| Consultar historial | GET | `/api/tickets/{id}/history` | — | `200` `TicketHistoryEntry[]` · `500` |
| Obtener ticket por ID | GET | `/api/tickets/{id}` | — | `200` `Ticket` · `404` |

**Ticket por ID [Propuesta, ver Q12]:** se usa al abrir el panel de detalle, para mostrar datos frescos y detectar con `404` un ticket inexistente. Como alternativa, el panel podría usar el ticket que ya está en el tablero y prescindir de este endpoint.

## 11. Arquitectura propuesta

**Stack [Propuesta, ver Q14]:** React 18 + **Vite** + **TypeScript**, con `fetch` nativo, CSS plano (CSS Modules, incluido en Vite) y sin router, gestor de estado global ni librerías de UI.

TypeScript se propone porque los modelos (R2.9) y las interfaces en inglés (R2.12) quedan explícitos y validados en compilación. No añade librerías en tiempo de ejecución.

```
┌──────────────────────────────────────────────────────────────┐
│ pages/       TicketsPage            (composición y coordinación) │
├──────────────────────────────────────────────────────────────┤
│ components/  TicketForm, TicketBoard, TicketCard…  (presentación)│
├──────────────────────────────────────────────────────────────┤
│ hooks/       useTickets, useTicketDetail, useForm  (estado)     │
├──────────────────────────────────────────────────────────────┤
│ services/    ticketService                    (contrato de la API) │
│              httpClient                       (fetch + errores)  │
├──────────────────────────────────────────────────────────────┤
│ models/      Ticket, TicketHistoryEntry, estados, prioridades,  │
│              transiciones, límites           (dominio, sin React)│
├──────────────────────────────────────────────────────────────┤
│ config/      apiConfig                        (variables de entorno)│
└──────────────────────────────────────────────────────────────┘
```

Reglas de dependencia:

- Una capa solo importa de las capas inferiores.
- Los componentes nunca importan `services/`; reciben datos y callbacks desde los hooks, a través de la página.
- `services/` no importa React.
- `models/` y `utils/` son funciones puras.

## 12. Estructura de carpetas

Se propone ubicar el frontend en `MaintenanceTickets_DotNet_Starter/frontend/`, junto a `MaintenanceTickets.Api/` y `database/` (ver Q15).

```
frontend/
├── .env.example                 # VITE_API_BASE_URL=https://localhost:5001
├── .gitignore
├── README.md
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── main.tsx                 # punto de entrada
    ├── App.tsx                  # raíz; renderiza TicketsPage
    ├── config/
    │   └── apiConfig.ts         # lee y valida VITE_API_BASE_URL
    ├── models/
    │   ├── ticket.ts            # Ticket, CreateTicketRequest, ChangeTicketStatusRequest
    │   ├── ticketHistory.ts     # TicketHistoryEntry, HistoryEventType
    │   ├── ticketStatus.ts      # TicketStatus, etiquetas UI, columnas, transiciones
    │   ├── ticketPriority.ts    # TicketPriority, etiquetas UI
    │   └── ticketValidationRules.ts # límites del contrato
    ├── services/
    │   ├── httpClient.ts        # fetch, JSON, timeout, normalización a ApiError
    │   ├── apiError.ts          # clase ApiError
    │   └── ticketService.ts     # las 5 operaciones de la API
    ├── hooks/
    │   ├── useTickets.ts        # listado, creación, cambio de estado
    │   ├── useTicketDetail.ts  # historial del ticket seleccionado
    │   └── useForm.ts           # valores, errores, touched, submit (reutilizable)
    ├── utils/
    │   ├── validateCreateTicket.ts
    │   ├── validateStatusChange.ts
    │   ├── formatDateTime.ts    # fechas UTC → hora local legible (ver Q11)
    │   └── getErrorMessage.ts   # ApiError → texto para el usuario
    ├── components/
    │   ├── ui/                  # genéricos, sin conocimiento de tickets
    │   │   ├── Button.tsx
    │   │   ├── FormField.tsx
    │   │   ├── TextInput.tsx
    │   │   ├── TextArea.tsx
    │   │   ├── SelectInput.tsx
    │   │   ├── Alert.tsx
    │   │   ├── Spinner.tsx
    │   │   ├── EmptyState.tsx
    │   │   └── Modal.tsx
    │   └── tickets/             # específicos del dominio
    │       ├── CreateTicketForm.tsx
    │       ├── TicketBoard.tsx
    │       ├── TicketColumn.tsx
    │       ├── TicketCard.tsx
    │       ├── PriorityBadge.tsx
    │       ├── StatusBadge.tsx
    │       ├── ChangeStatusDialog.tsx
    │       ├── TicketDetailPanel.tsx
    │       └── TicketHistoryList.tsx
    ├── pages/
    │   └── TicketsPage.tsx
    └── styles/
        └── global.css           # variables de color, tipografía, reset
```

**Responsabilidad de cada carpeta**

| Carpeta | Contenido |
|---|---|
| `config/` | Único punto de lectura de variables de entorno. |
| `models/` | Tipos que reflejan el contrato real y constantes de dominio (estados, prioridades, transiciones, límites). No contiene lógica de UI ni HTTP. |
| `services/` | Único lugar con rutas HTTP y `fetch`. |
| `hooks/` | Estado de React y orquestación de llamadas a servicios. |
| `utils/` | Funciones puras reutilizables (validación, formato, mensajes). |
| `components/ui/` | Piezas visuales genéricas reutilizables. |
| `components/tickets/` | Piezas visuales del dominio de tickets. |
| `pages/` | Composición de la pantalla y coordinación entre componentes. |
| `styles/` | Estilos globales; los estilos de cada componente van en su `*.module.css`, junto al componente. |

## 13. Componentes necesarios

**Dominio:** `TicketsPage`, `CreateTicketForm`, `TicketBoard`, `TicketColumn`, `TicketCard`, `PriorityBadge`, `StatusBadge`, `ChangeStatusDialog`, `TicketDetailPanel` y `TicketHistoryList`.

**UI genérica:** `Button`, `FormField`, `TextInput`, `TextArea`, `SelectInput`, `Alert`, `Spinner`, `EmptyState` y `Modal`.

## 14. Responsabilidad de cada componente

| Componente | Responsabilidad | Props principales |
|---|---|---|
| `TicketsPage` | Usa `useTickets` y `useTicketDetail`, guarda el ticket seleccionado y la transición en curso, y compone el formulario, el tablero, el diálogo y el panel. | — |
| `CreateTicketForm` | Captura y valida los datos, llama a `onSubmit`, muestra los errores por campo y los de la API, y se limpia al tener éxito. | `onSubmit`, `isSubmitting` |
| `TicketBoard` | Agrupa los tickets por estado (con `useMemo`) y renderiza las tres columnas, o el estado de carga, error o vacío. | `tickets`, `isLoading`, `error`, `onRetry`, `onSelectTicket`, `onRequestTransition` |
| `TicketColumn` | Muestra el título y contador de una columna y la lista de tarjetas, o `EmptyState` si no hay tickets. | `title`, `tickets`, callbacks |
| `TicketCard` | Muestra `id`, `title`, `assetCode`, `priority`, `reportedBy` y `createdAt`; un botón "Ver detalle"; y **un único** botón con la siguiente transición, si existe. | `ticket`, `onSelect`, `onRequestTransition` |
| `PriorityBadge` / `StatusBadge` | Etiqueta en español y estilo según el valor. | `priority` / `status` |
| `ChangeStatusDialog` | Formulario de transición con los campos exactos que exige el destino; muestra los errores de validación y los de la API (`400` / `409`). | `ticket`, `targetStatus`, `onConfirm`, `onCancel`, `isSubmitting`, `serverError` |
| `TicketDetailPanel` | Muestra todos los campos reales del ticket (incluidos `description`, `diagnosis`, `resolution` y `updatedAt`) y su historial. | `ticket`, `history`, `isLoading`, `error`, `onClose` |
| `TicketHistoryList` | Lista cronológica de eventos: tipo, `fromStatus → toStatus`, comentario, autor y fecha. | `entries` |
| `Button` | Botón con variantes y estado `isLoading`, que se deshabilita durante las operaciones. | `variant`, `isLoading`, … |
| `FormField` | Label, control, mensaje de error y contador de caracteres, con `aria-invalid` y `aria-describedby`. | `label`, `error`, `maxLength`, `children` |
| `TextInput`, `TextArea`, `SelectInput` | Controles accesibles y controlados. | estándar |
| `Alert` | Mensaje de éxito, error o información. | `variant`, `message`, `onClose` |
| `Spinner` / `EmptyState` | Indicador de carga / mensaje de lista vacía. | `label` / `message` |
| `Modal` | Diálogo accesible (foco inicial, cierre con Esc). | `isOpen`, `title`, `onClose` |

## 15. Servicios de API

### `services/httpClient.ts`

- `request<T>(path, { method, body, signal })`:
  - Arma la URL con `API_BASE_URL` y envía y recibe JSON.
  - Si la respuesta no es 2xx, lanza un `ApiError` con `status`, `message` (el `message` del cuerpo o el `title` de *ProblemDetails*) y `fieldErrors` (`errors` de *ProblemDetails*, con las claves pasadas de `Title` a `title`).
  - Si `fetch` falla, lanza `ApiError` con `kind: 'network'`.
  - Admite respuestas sin cuerpo (`404`).
  - Acepta `AbortSignal` para cancelar peticiones al desmontar.
- Considera éxito cualquier 2xx, por la discrepancia `200`/`201` del POST.

### `services/ticketService.ts`

```ts
getTickets(): Promise<Ticket[]>                                         // GET  /api/tickets
getTicketById(id: number): Promise<Ticket>                              // GET  /api/tickets/{id}   (Q12)
createTicket(request: CreateTicketRequest): Promise<Ticket>             // POST /api/tickets
changeTicketStatus(id: number, request: ChangeTicketStatusRequest): Promise<Ticket> // PUT /api/tickets/{id}/status
getTicketHistory(id: number): Promise<TicketHistoryEntry[]>             // GET  /api/tickets/{id}/history
```

- La ruta base `'/api/tickets'` se declara una sola vez.
- Solo se envían los campos del DTO; los textos van con `trim()` y los opcionales vacíos como `null`.

## 16. Modelos necesarios

Reflejan el contrato real, sin campos adicionales:

```ts
type TicketStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';   // [API real]
type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';            // [API real]
type HistoryEventType = 'CREATED' | 'STATUS_CHANGED';                   // [API real]

interface Ticket {
  id: number;
  title: string;
  assetCode: string;
  description: string | null;
  priority: TicketPriority;
  status: TicketStatus;
  diagnosis: string | null;
  resolution: string | null;
  reportedBy: string;
  createdAt: string;   // ISO UTC (ver F10)
  updatedAt: string;
  // `history` existe en la respuesta, pero el listado siempre lo trae vacío (F9).
  // No se modela para evitar usarlo por error; el historial se obtiene con getTicketHistory().
}

interface TicketHistoryEntry {
  id: number;
  ticketId: number;
  eventType: HistoryEventType;
  fromStatus: TicketStatus | null;
  toStatus: TicketStatus | null;
  comment: string | null;
  performedBy: string;
  createdAt: string;
  // `ticket` llega siempre como null y se omite.
}

interface CreateTicketRequest {        // = CreateTicketDto [Swagger]
  title: string;
  assetCode: string;
  description: string | null;
  priority: TicketPriority;
  reportedBy: string;
}

interface ChangeTicketStatusRequest {  // = ChangeStatusDto [Swagger]
  newStatus: TicketStatus;
  diagnosis: string | null;
  resolution: string | null;
  performedBy: string;
  comment: string | null;
}
```

## 17. Manejo de estado

Se usa solo React (`useState`, `useReducer`, `useMemo` y hooks propios). Con una sola pantalla y un solo recurso, una librería de estado global no aporta nada.

| Estado | Dónde vive | Estrategia |
|---|---|---|
| Listado de tickets | `useTickets` (`useReducer`) | `{ tickets, isLoading, loadError }`. Se carga al montar y expone `reload()`. |
| Creación | `useTickets.createTicket` | Inserta al inicio el ticket devuelto por la API, sin recargar. Expone `isCreating`. |
| Cambio de estado | `useTickets.changeStatus` | Reemplaza el ticket con la respuesta. Ante `404`/`409`, ejecuta `reload()`. Expone `transitioningTicketId`. Sin actualizaciones optimistas. |
| Ticket seleccionado | `TicketsPage` (`useState<number \| null>`) | Se guarda el **id** y el ticket se deriva del listado, para no duplicar datos. |
| Transición en curso | `TicketsPage` (`useState`) | `{ ticket, targetStatus } \| null` controla el diálogo. |
| Historial | `useTicketDetail(ticketId)` | `{ entries, isLoading, error }`. Se recarga al cambiar el id y después de una transición exitosa del ticket abierto. |
| Formularios | `useForm` | `values`, `errors`, `touched`, `handleChange`, `handleSubmit`, `setServerErrors` y `reset`. |
| Columnas | `TicketBoard` (`useMemo`) | Derivadas de `tickets`; no se almacenan. |
| Mensajes de éxito | `TicketsPage` | `Alert` temporal. |

## 18. Flujo para crear ticket

`Usuario → CreateTicketForm → useTickets.createTicket → ticketService.createTicket → httpClient → POST /api/tickets → TicketsController → TicketService → TicketRepository (transacción: Tickets + TicketHistory 'CREATED') → SQL Server`

1. El usuario completa el formulario y pulsa "Crear ticket".
2. `validateCreateTicket(values)` valida los datos. Si hay errores, se muestran junto a los campos, se enfoca el primero inválido y **no hay petición**.
3. Durante el envío, el botón se deshabilita y muestra "Creando…".
4. Según la respuesta:
   - **`201`:** el ticket aparece en "Pendiente", el formulario se limpia y se muestra "Ticket creado".
   - **`400` con `errors`:** errores por campo.
   - **`400` con `message`:** mensaje general.
   - **`500` o error de red:** `Alert` y se conservan los datos escritos.

## 19. Flujo para listar tickets

`TicketsPage (mount) → useTickets → ticketService.getTickets → GET /api/tickets → Backend → SQL Server`

1. Mientras carga, se muestra `Spinner` en el tablero.
2. Si la carga tiene éxito, `TicketBoard` agrupa los tickets por `status` en las tres columnas, respetando el orden de la API.
3. Si una columna está vacía, se muestra `EmptyState` ("No hay tickets").
4. Si la carga falla, se muestra `Alert` con el mensaje y el botón "Reintentar".
5. Los tickets `CLOSED` se tratan según la respuesta a Q6.

## 20. Flujo para cambiar estado

`Operador → TicketCard → ChangeStatusDialog → useTickets.changeStatus → ticketService.changeTicketStatus → PUT /api/tickets/{id}/status → TicketsController → TicketService (máquina de estados) → TicketRepository → sp_TransitionTicketStatus (UPDATE Tickets + INSERT TicketHistory 'STATUS_CHANGED') → SQL Server`

1. `TicketCard` muestra solo la acción que devuelve `getNextStatus(ticket.status)`.
2. Al pulsarla, se abre `ChangeStatusDialog` con los campos exactos del destino (sección 7).
3. `validateStatusChange` valida los datos. Si hay errores, no hay petición.
4. `changeStatus` revalida `canTransition(current, target)` y solo entonces llama a la API. Mientras tanto, el botón muestra "Guardando…" y la tarjeta queda deshabilitada.
5. Según la respuesta:
   - **`200`:** se reemplaza el ticket, la tarjeta cambia de columna, se cierra el diálogo, se muestra un mensaje de éxito y, si el panel de detalle está abierto, se recarga el historial.
   - **`400`:** errores por campo en el diálogo.
   - **`409`:** se muestra el mensaje del backend en el diálogo y se recarga el tablero.
   - **`404`:** "El ticket ya no existe"; se cierra el diálogo y se recarga el tablero.
   - **`500` o error de red:** mensaje en el diálogo, conservando los datos.

## 21. Flujo para consultar historial

`Usuario → TicketCard "Ver detalle" → TicketsPage (selectedTicketId) → useTicketDetail → ticketService.getTicketHistory → GET /api/tickets/{id}/history → Backend → SQL Server`

1. Se abre `TicketDetailPanel` con los datos del ticket.
2. El historial carga con `Spinner`. Si no hay eventos, se muestra "Sin eventos registrados"; si la carga falla, `Alert` con "Reintentar".
3. Cada evento muestra:
   - el tipo (`CREATED` → "Creado", `STATUS_CHANGED` → "Cambio de estado");
   - `fromStatus → toStatus`, con etiquetas en español;
   - `comment`, `performedBy` y `createdAt` formateado.
4. Solo se muestran los campos que devuelve la API.

## 22. Manejo de errores

Se manejan solo los casos que el backend realmente produce:

| Caso | Detección | Mensaje al usuario | Acción |
|---|---|---|---|
| Backend no disponible o sin conexión (incluye certificado HTTPS no confiable y CORS) | `fetch` lanza excepción → `ApiError.kind = 'network'` | "No se pudo conectar con el servidor. Verifica tu conexión o intenta más tarde." | "Reintentar" |
| Validación del modelo | `400` con `errors` | Mensaje junto a cada campo | Conservar el formulario |
| Error de negocio al crear | `400` con `message` | Mensaje de la API (Q13) | Conservar el formulario |
| Transición rechazada | `409` con `message` | Mensaje de la API (Q13) | Recargar el tablero |
| Ticket inexistente | `404` en `PUT` o `GET /{id}` | "El ticket no existe." | Cerrar el diálogo o panel y recargar |
| Error del servidor | `500` u otro `5xx` | "Ocurrió un error en el servidor. Intenta nuevamente." | Conservar los datos |
| Respuesta inesperada | cualquier otro código | "Ocurrió un error inesperado (código {status})." | — |

La traducción de errores a texto se centraliza en `utils/getErrorMessage.ts`; ningún componente interpreta códigos HTTP.

## 23. Variables de entorno

| Variable | Uso | Desarrollo | Producción |
|---|---|---|---|
| `VITE_API_BASE_URL` | URL base del backend, sin `/` final | `https://localhost:5001` | URL pública del backend desplegado |

- `.env.example` (versionado) documenta la variable.
- `.env.local` (no versionado) contiene el valor real.
- `config/apiConfig.ts` es el único lugar que la lee. Si falta en el build de producción, se muestra un error explícito en lugar de usar `localhost` en silencio.
- Las variables `VITE_*` se **incrustan en el build** y son públicas, así que nunca deben contener secretos (tampoco hay ninguno que guardar).

## 24. Buenas prácticas

- Código, archivos, tipos, funciones y componentes en inglés; textos de UI en español.
- Componentes pequeños con una sola responsabilidad.
- Una única fuente de verdad para URL, rutas, estados, prioridades, transiciones, límites y mensajes.
- Funciones puras para validaciones, transiciones y formato.
- Ningún `fetch` fuera de `services/`.
- Formularios controlados, validación en cliente y asignación de los errores del servidor a los campos.
- Botones deshabilitados durante las operaciones, para evitar envíos duplicados.
- Sin actualizaciones optimistas: la UI refleja lo que confirma el backend.
- Accesibilidad: labels asociados, `aria-invalid`, `aria-describedby`, foco gestionado en el modal y navegación con teclado.
- `key` estables (`id`) y peticiones cancelables al desmontar.
- TypeScript en modo `strict`; sin `any`, sin `console.log` y sin código muerto.

## 25. Consideraciones para despliegue

No se despliega todavía; esto queda preparado:

- `npm run build` genera estáticos en `dist/`, servibles en cualquier hosting estático (Azure Static Web Apps, Netlify, Vercel o GitHub Pages).
- Al no usar router, no hacen falta reglas de *rewrite*.
- `VITE_API_BASE_URL` se configura en el proveedor en el momento del build.
- **Dependencias del backend**, fuera del alcance del frontend pero necesarias para la URL pública:
  - El backend debe estar desplegado con una **URL HTTPS pública**. Una página HTTPS no puede llamar a `localhost`, y tampoco a HTTP, por *mixed content*.
  - CORS ya admite cualquier origen (`AllowAnyOrigin`), así que funcionará con el dominio público. Se podría restringir al dominio del frontend, pero eso es un cambio de backend.
- En desarrollo, el certificado HTTPS de .NET debe ser de confianza (`dotnet dev-certs https --trust`).

## 26. Consideraciones para GitHub

- El frontend vive en `frontend/`, dentro del mismo repositorio que el backend y `database/` (los stored procedures ya están versionados en el commit `2b7c725`).
- `frontend/.gitignore`: `node_modules/`, `dist/`, `.env`, `.env.local`, `.env.*.local`, `*.log`, `.vite/`, `coverage/` y archivos del editor y del sistema operativo.
- Se versionan `package-lock.json` y `.env.example`.
- Sin secretos, credenciales ni URLs privadas en el código.
- Sin archivos de plantilla sobrantes de Vite (logos, `App.css` de ejemplo, etc.).
- Commits pequeños, uno por paso del orden de implementación.

## 27. Consideraciones para README

`frontend/README.md`, en inglés:

1. Propósito y capturas de pantalla.
2. Stack.
3. Requisitos (Node LTS, backend en ejecución, certificado de desarrollo de confianza).
4. Configuración (`.env.local` a partir de `.env.example`).
5. Scripts (`dev`, `build`, `preview`, `lint`).
6. Estructura de carpetas y responsabilidades.
7. Endpoints consumidos (tabla de la sección 10).
8. Máquina de estados y cómo la respeta la UI.
9. Flujos y diagramas de secuencia (creación, cambio de estado e historial).
10. Manejo de errores.
11. Despliegue.

Además, se propone enlazar el README del frontend desde el README raíz del proyecto.

## 28. Orden de implementación paso a paso

Cada paso se entrega por separado para tu revisión:

1. **Scaffold:** Vite + React + TS en `frontend/`, limpieza de plantilla, `.gitignore`, `.env.example` y `config/apiConfig.ts`.
2. **Modelos:** `models/*` (tipos, estados, prioridades, transiciones y límites).
3. **Capa HTTP:** `apiError.ts`, `httpClient.ts` y `ticketService.ts`, verificados contra la API real.
4. **Utilidades:** validaciones, `formatDateTime` y `getErrorMessage`.
5. **Hooks:** `useForm`, `useTickets` y `useTicketDetail`.
6. **UI genérica:** `components/ui/*` y `styles/global.css`.
7. **Tablero:** `TicketBoard`, `TicketColumn`, `TicketCard`, badges y `TicketsPage`, verificando carga, vacío y error.
8. **Creación:** `CreateTicketForm`, verificando validaciones, `201` y `400`.
9. **Transiciones:** `ChangeStatusDialog`, verificando `200`, `400`, `404` y `409`.
10. **Historial:** `TicketDetailPanel` y `TicketHistoryList`.
11. **Errores de conexión:** pruebas con el backend apagado.
12. **Pulido:** estilos, accesibilidad y diseño responsive.
13. **README** del frontend y verificación de `npm run build`.
14. **Revisión final** con el checklist de la sección 29.

## 29. Checklist final de cumplimiento

### 29.1 Rúbrica

| Requirement | Frontend impact | Status |
|---|---|---|
| R2.1 Frontend | Formulario de creación + panel Kanban de estados | Pending |
| R2.2 State machine | Transiciones reflejadas del backend en un único módulo; solo acciones válidas | Pending |
| R2.3 Business logic | Pendiente → Resuelto nunca se ofrece; revalidación previa; manejo de `409` | Pending |
| R2.4 Database | Sin acceso directo; modelo Ticket 1 → N History respetado | N/A |
| R2.5 Stored Procedures | Consumidos indirectamente mediante `PUT /api/tickets/{id}/status` | N/A |
| R2.6 Traceability | Panel de detalle con `GET /api/tickets/{id}/history` | Pending |
| R2.7 Architecture | config / models / services / hooks / components / pages | Pending |
| R2.8 Sequence analysis | Cadenas de llamadas fijas para crear, listar, cambiar estado e historial | Pending |
| R2.9 Data structure | `Ticket`, `TicketHistoryEntry` y requests idénticos al contrato | Pending |
| R2.10 Deployment | `VITE_API_BASE_URL` + build estático | Pending |
| R2.11 Source code | `frontend/` en el repositorio, `.gitignore`, sin secretos | Pending |
| R2.12 Documentation | Código en inglés + README del frontend | Pending |

### 29.2 Funcional

- [ ] El formulario exige Título, Equipo, Descripción y Prioridad (y "Reportado por", según Q5).
- [ ] Los límites (150 / 30 / 2000 / 100) y el mínimo del título (según Q2) se validan antes de enviar.
- [ ] Los errores de la API se muestran en su campo o como mensaje general.
- [ ] El tablero tiene tres columnas pobladas según el `status` real.
- [ ] Hay estados de carga, vacío, error y reintento en el tablero y el historial.
- [ ] Cada tarjeta muestra como máximo una acción, siempre válida.
- [ ] El diálogo pide diagnóstico o resolución según el destino, y siempre "Realizado por".
- [ ] Los errores `409` y `404` muestran un mensaje y resincronizan el tablero.
- [ ] El historial muestra solo los campos reales.
- [ ] Las fechas se muestran correctamente (según Q11).

### 29.3 Técnico

- [ ] No hay `fetch` ni URLs fuera de `services/` y `config/`.
- [ ] No hay librerías no aprobadas en `package.json`.
- [ ] TypeScript `strict` sin errores; `npm run build` funciona.
- [ ] No hay LocalStorage, mocks, login ni funcionalidades excluidas.
- [ ] El `.gitignore` es correcto y no hay secretos.

## 30. Preguntas y decisiones pendientes

Necesito tu respuesta antes de implementar. Cada pregunta incluye la propuesta por defecto que aplicaré si la apruebas.

| # | Tema | Pregunta | Propuesta por defecto |
|---|---|---|---|
| **Q1** | Equipo | ¿"Equipo" corresponde a `assetCode` (máx. 30)? Es texto libre, porque no hay endpoint de equipos. | Sí, texto libre, máx. 30, con la etiqueta "Equipo (código)". |
| **Q2** | Mínimo del título | Swagger exige un **mínimo de 3 caracteres**. ¿Lo aplico en el frontend? | Sí: es una regla del backend, no una nueva. |
| **Q3** | Descripción | En la API es opcional; tú la pides obligatoria. ¿La mantengo obligatoria solo en la UI? | Sí. |
| **Q4** | Prioridades | Swagger no define el enum. La API acepta `LOW`, `MEDIUM`, `HIGH` y `CRITICAL`. ¿Uso esos cuatro valores con las etiquetas Baja, Media, Alta y Crítica? ¿Con alguno preseleccionado? | Los cuatro valores, sin preselección. |
| **Q5** | `reportedBy` / `performedBy` | Son obligatorios en la API, pero no puede haber login ni usuarios. ¿Agrego un campo de texto libre "Reportado por" en el formulario y "Realizado por" en el diálogo? | Sí, texto libre obligatorio (máx. 100 en "Reportado por"). |
| **Q6** | Estado `CLOSED` | El backend tiene `RESOLVED → CLOSED`. Con tres columnas, (a) ¿no ofrezco la acción "Cerrar"? y (b) ¿qué hago con los tickets `CLOSED` que existan: ocultarlos o mostrarlos en "Resuelto" con la etiqueta "Cerrado"? | (a) No ofrecer "Cerrar". (b) Ocultarlos. |
| **Q7** | Datos de la transición | ¿Apruebas el diálogo con Diagnóstico o Resolución (obligatorio según el destino), "Realizado por" (obligatorio) y Comentario (opcional)? | Sí. |
| **Q8** | Longitudes en el diálogo | Swagger no define máximos para `diagnosis`, `resolution`, `comment` ni `performedBy` (la base de datos usa 2000/2000/2000/100). ¿Los aplico? | No aplicarlos; si se excede, se maneja el error del servidor. |
| **Q9** | Contrato no documentado | ¿Autorizas a usar el comportamiento real verificado (formas de respuesta, códigos `201`/`400`/`404`/`409`/`500` y valores de estado y evento) aunque no figure en Swagger? | Sí, sin modificar el backend. |
| **Q10** | Transiciones en el frontend | La API no expone la máquina de estados. ¿Apruebas replicar las transiciones en un único módulo para mostrar solo las acciones válidas, manteniendo al backend como autoridad final (manejo de `409`)? | Sí. |
| **Q11** | Fechas sin zona horaria | Los GET devuelven fechas UTC sin `Z` (F10). ¿Las trato como UTC en el frontend al formatearlas, o prefieres corregirlo en el backend? | Tratarlas como UTC en `formatDateTime` y mostrarlas en hora local. |
| **Q12** | `GET /api/tickets/{id}` | ¿Lo uso al abrir el detalle (datos frescos y `404`) o el panel usa el ticket del tablero? | Usarlo al abrir el detalle. |
| **Q13** | Idioma de los mensajes de la API | Los mensajes del backend están en inglés. ¿Los muestro tal cual, o traduzco los conocidos y muestro el original como respaldo? | Mostrarlos tal cual dentro de un texto en español (p. ej. "No se pudo cambiar el estado: Invalid transition…"). |
| **Q14** | Stack | ¿Apruebas Vite + React 18 + **TypeScript** + CSS Modules, sin otras librerías? ¿O prefieres JavaScript? | TypeScript. |
| **Q15** | Ubicación | ¿El frontend va en `MaintenanceTickets_DotNet_Starter/frontend/`? | Sí. |
| **Q16** | Pruebas automatizadas | ¿Quieres pruebas del frontend (Vitest + Testing Library, dependencias de desarrollo)? | No, salvo que lo pidas. |
| **Q17** | Pendiente de una tarea anterior | En `MaintenanceTickets.Api/Program.cs` agregué `public partial class Program { }` y existe la carpeta `MaintenanceTickets.Api.Tests/` para las pruebas de integración que interrumpiste. ¿Las conservo o las elimino? | Sin cambios hasta que lo decidas. |

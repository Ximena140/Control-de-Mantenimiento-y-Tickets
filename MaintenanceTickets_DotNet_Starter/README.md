# Maintenance Tickets — .NET Starter

Starter backend for the DTP-L2 maintenance tickets challenge.

## Stack
- ASP.NET Core Web API (.NET 8 / C#)
- SQL Server
- Entity Framework Core
- Swagger/OpenAPI

## Open it with
Visual Studio Code is recommended. Visual Studio 2022 also works. IntelliJ IDEA is not the best choice for this C# project; JetBrains Rider is the JetBrains IDE for .NET.

## 1. Requirements
Install:
1. .NET 8 SDK
2. Visual Studio Code
3. VS Code C# Dev Kit extension
4. SQL Server
5. SQL Server Management Studio (SSMS), optional but recommended

## 2. Create the database
Open SSMS and run these scripts in order:
1. `database/01_schema.sql`
2. `database/02_sp_TransitionTicketStatus.sql`

## 3. Configure the connection
Open `MaintenanceTickets.Api/appsettings.json`.

Windows Authentication example:
`Server=localhost;Database=MaintenanceTicketsDb;Trusted_Connection=True;TrustServerCertificate=True;`

SQL Authentication example:
`Server=localhost;Database=MaintenanceTicketsDb;User Id=sa;Password=YOUR_PASSWORD;TrustServerCertificate=True;`

If you use SQL Express, your server may be `localhost\\SQLEXPRESS`.

## 4. Run the backend
Open a terminal in `MaintenanceTickets.Api` and run:

```bash
dotnet restore
dotnet run
```

The terminal will show the local URL. Open `/swagger` on that URL.

Example:
`https://localhost:5001/swagger/index.html`

## 5. First tests in Swagger
### Create a ticket
POST `/api/tickets`

```json
{
  "title": "ATM screen is not working",
  "assetCode": "ATM-0451",
  "description": "The screen remains black.",
  "priority": "HIGH",
  "reportedBy": "Ximena"
}
```

### List tickets
GET `/api/tickets`

### Start work
PUT `/api/tickets/{id}/status`

```json
{
  "newStatus": "IN_PROGRESS",
  "diagnosis": "Power supply failure detected.",
  "resolution": null,
  "performedBy": "Operator 1",
  "comment": "Diagnosis completed."
}
```

### Resolve
```json
{
  "newStatus": "RESOLVED",
  "diagnosis": null,
  "resolution": "Power supply replaced.",
  "performedBy": "Operator 1",
  "comment": "Equipment tested successfully."
}
```

### View history
GET `/api/tickets/{id}/history`

## Architecture
Controller -> Service -> Repository -> SQL Server

- Controller: HTTP requests/responses
- Service: business rules and state machine
- Repository: database access
- SQL Server: persistence and stored procedure

## State machine
PENDING -> IN_PROGRESS -> RESOLVED

- New tickets start as PENDING, and a CREATED history entry is saved in the same transaction.
- PENDING -> IN_PROGRESS requires a diagnosis.
- IN_PROGRESS -> RESOLVED requires a resolution.
- Every transition requires `performedBy`; `comment` is optional.
- Invalid transitions (for example PENDING -> RESOLVED) are rejected with `409 Conflict`.
- The SQL stored procedure updates the ticket and inserts a STATUS_CHANGED history entry in the same transaction.
- The allowed transitions are defined in `Entities/TicketStatus.cs` and mirrored by `sp_TransitionTicketStatus`.

## Data model
Ticket 1 ─── N TicketHistory (foreign key `TicketHistory.TicketId`).

The entities have no navigation properties, so API responses never contain cycles. A ticket's history is read from GET `/api/tickets/{id}/history`.

## Updating an existing database
`01_schema.sql` drops and recreates the tables. To update an existing database without losing data, run `02_sp_TransitionTicketStatus.sql` and replace the status constraint:

```sql
ALTER TABLE dbo.Tickets DROP CONSTRAINT CK_Tickets_Status;
ALTER TABLE dbo.Tickets ADD CONSTRAINT CK_Tickets_Status CHECK (Status IN ('PENDING','IN_PROGRESS','RESOLVED'));
```

## Deployment
The app is deployed on Railway as three services:

| Service | URL |
|---|---|
| Frontend | https://handsome-gentleness-production-1ad9.up.railway.app |
| API (Swagger) | https://control-de-mantenimiento-y-tickets-production.up.railway.app/swagger |
| SQL Server | Private, reachable only by the API |

- **API**: built from `MaintenanceTickets.Api/Dockerfile`. The connection string is set with the `ConnectionStrings__DefaultConnection` environment variable.
- **Frontend**: built from `frontend/Dockerfile`. The API URL is set at build time with `VITE_API_BASE_URL`.
- **Database**: SQL Server container, initialized with the scripts in `database/`.

## AI-assisted development
See [PROMPTS.md](PROMPTS.md) for the prompts used to build the frontend.

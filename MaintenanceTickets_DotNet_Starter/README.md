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
PENDING -> IN_PROGRESS -> RESOLVED -> CLOSED

- PENDING -> IN_PROGRESS requires a diagnosis.
- IN_PROGRESS -> RESOLVED requires a resolution.
- Invalid transitions are rejected.
- The SQL stored procedure updates the ticket and inserts history in the same transaction.

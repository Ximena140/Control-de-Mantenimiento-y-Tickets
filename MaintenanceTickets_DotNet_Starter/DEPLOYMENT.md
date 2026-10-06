# Deployment on Railway

The app runs as three services in one Railway project, all deployed from this GitHub repository:

| Service | Source | Public |
|---|---|---|
| `sqlserver` | Docker image `mcr.microsoft.com/mssql/server:2022-latest` + volume | No (TCP proxy only to run the scripts) |
| `api` | `MaintenanceTickets_DotNet_Starter/MaintenanceTickets.Api/Dockerfile` | Yes |
| `web` | `MaintenanceTickets_DotNet_Starter/frontend/Dockerfile` | Yes |

```
Browser ──HTTPS──▶ web (Caddy, static React build)
   │
   └─────HTTPS──▶ api (ASP.NET Core) ──private network──▶ sqlserver (SQL Server Express)
```

> Railway has no managed SQL Server, so it runs as a container. SQL Server needs **at least 2 GB of RAM**, which requires a paid Railway plan (Hobby or higher). As an alternative, any external SQL Server (for example Azure SQL) works by changing only the `api` connection string.

## 1. SQL Server

1. In the Railway project: **New → Docker Image** → `mcr.microsoft.com/mssql/server:2022-latest`. Rename the service to `sqlserver`.
2. **Variables**:

   | Variable | Value |
   |---|---|
   | `ACCEPT_EULA` | `Y` |
   | `MSSQL_PID` | `Express` |
   | `MSSQL_SA_PASSWORD` | A strong password (8+ characters with uppercase, lowercase, digits and symbols) |
   | `RAILWAY_RUN_UID` | `0` (lets SQL Server write to the Railway volume) |

3. **Volume**: right-click the service → **Attach volume** → mount path `/var/opt/mssql`.
4. **Settings → Networking → TCP Proxy** → port `1433`. Railway shows a public address such as `xxxx.proxy.rlwy.net:12345`.
5. Wait until the logs show `SQL Server is now ready for client connections`.

## 2. Database scripts

From the repository root, run both scripts against the TCP proxy address (replace host, port and password):

```bash
sqlcmd -S xxxx.proxy.rlwy.net,12345 -U sa -P "<MSSQL_SA_PASSWORD>" -C -i MaintenanceTickets_DotNet_Starter/database/01_schema.sql
sqlcmd -S xxxx.proxy.rlwy.net,12345 -U sa -P "<MSSQL_SA_PASSWORD>" -C -i MaintenanceTickets_DotNet_Starter/database/02_sp_TransitionTicketStatus.sql
```

## 3. API

1. **New → GitHub Repo** → this repository. Rename the service to `api`.
2. **Settings → Source → Root Directory**: `MaintenanceTickets_DotNet_Starter/MaintenanceTickets.Api`.
3. **Variables**:

   | Variable | Value |
   |---|---|
   | `ConnectionStrings__DefaultConnection` | `Server=${{sqlserver.RAILWAY_PRIVATE_DOMAIN}},1433;Database=MaintenanceTicketsDb;User Id=sa;Password=${{sqlserver.MSSQL_SA_PASSWORD}};TrustServerCertificate=True` |

4. **Settings → Networking → Generate Domain**. Swagger is available at `https://<api-domain>/swagger`.

The container listens on the `PORT` that Railway injects. Railway terminates HTTPS in front of it.

## 4. Frontend

1. **New → GitHub Repo** → the same repository. Rename the service to `web`.
2. **Settings → Source → Root Directory**: `MaintenanceTickets_DotNet_Starter/frontend`.
3. **Variables**:

   | Variable | Value |
   |---|---|
   | `VITE_API_BASE_URL` | `https://${{api.RAILWAY_PUBLIC_DOMAIN}}` |

4. **Settings → Networking → Generate Domain**. This is the public URL of the application.

`VITE_API_BASE_URL` is embedded in the bundle at build time. If it changes, redeploy `web`.

## Verification

1. `https://<api-domain>/api/tickets` returns `200` with a JSON array.
2. `https://<web-domain>` shows the board. Creating a ticket and moving it to *En Proceso* and *Resuelto* works.
3. The ticket detail shows its history.

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| `sqlserver` restarts with permission errors on `/var/opt/mssql` | `RAILWAY_RUN_UID=0` is missing. |
| `sqlserver` exits right after starting | The plan has less than 2 GB of RAM, or `MSSQL_SA_PASSWORD` does not meet the complexity rules. |
| `api` logs SQL connection timeouts | The private network may not resolve. Temporarily use the TCP proxy in the connection string: `Server=${{sqlserver.RAILWAY_TCP_PROXY_DOMAIN}},${{sqlserver.RAILWAY_TCP_PROXY_PORT}};…` |
| The web shows "No se pudo conectar con el servidor" | `VITE_API_BASE_URL` is wrong or was set after the build: fix it and redeploy `web`. |
| The web shows "La aplicación no tiene configurada la dirección del servidor" | `VITE_API_BASE_URL` was empty during the build. |

# Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY MaintenanceTickets.Api.csproj ./
RUN dotnet restore
COPY . .
RUN dotnet publish -c Release -o /app/publish --no-restore

# Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .

# Railway injects PORT; 8080 is the fallback for running the image elsewhere.
# The connection string comes from the ConnectionStrings__DefaultConnection environment variable.
ENTRYPOINT ["sh", "-c", "exec dotnet MaintenanceTickets.Api.dll --urls http://0.0.0.0:${PORT:-8080}"]

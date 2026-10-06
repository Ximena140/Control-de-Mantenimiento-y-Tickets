namespace MaintenanceTickets.Api.Entities;

/// <summary>Allowed values of Tickets.Priority.</summary>
public static class TicketPriority
{
    public static readonly IReadOnlySet<string> All = new HashSet<string> { "LOW", "MEDIUM", "HIGH", "CRITICAL" };
}

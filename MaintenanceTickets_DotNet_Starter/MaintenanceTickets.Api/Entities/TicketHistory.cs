namespace MaintenanceTickets.Api.Entities;

/// <summary>Event of a ticket. Each ticket has many history entries (FK TicketHistory.TicketId → Tickets.Id).</summary>
public class TicketHistory
{
    public long Id { get; set; }
    public int TicketId { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string? FromStatus { get; set; }
    public string? ToStatus { get; set; }
    public string? Comment { get; set; }
    public string PerformedBy { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

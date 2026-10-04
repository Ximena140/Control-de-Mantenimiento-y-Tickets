namespace MaintenanceTickets.Api.Entities;

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

    public Ticket? Ticket { get; set; }
}

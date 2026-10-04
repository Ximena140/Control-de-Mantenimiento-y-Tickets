namespace MaintenanceTickets.Api.Entities;

public class Ticket
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string AssetCode { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Priority { get; set; } = "MEDIUM";
    public string Status { get; set; } = "PENDING";
    public string? Diagnosis { get; set; }
    public string? Resolution { get; set; }
    public string ReportedBy { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<TicketHistory> History { get; set; } = new List<TicketHistory>();
}

using System.ComponentModel.DataAnnotations;

namespace MaintenanceTickets.Api.DTOs;

public class CreateTicketDto
{
    [Required, MinLength(3), MaxLength(150)]
    public string Title { get; set; } = string.Empty;

    [Required, MaxLength(30)]
    public string AssetCode { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }

    [Required]
    public string Priority { get; set; } = "MEDIUM";

    [Required, MaxLength(100)]
    public string ReportedBy { get; set; } = string.Empty;
}

using System.ComponentModel.DataAnnotations;

namespace MaintenanceTickets.Api.DTOs;

public class ChangeStatusDto
{
    [Required]
    public string NewStatus { get; set; } = string.Empty;

    public string? Diagnosis { get; set; }
    public string? Resolution { get; set; }

    [Required]
    public string PerformedBy { get; set; } = string.Empty;

    public string? Comment { get; set; }
}

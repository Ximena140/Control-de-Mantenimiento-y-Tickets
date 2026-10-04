using MaintenanceTickets.Api.DTOs;
using MaintenanceTickets.Api.Entities;
using MaintenanceTickets.Api.Exceptions;
using MaintenanceTickets.Api.Repositories;

namespace MaintenanceTickets.Api.Services;

public class TicketService : ITicketService
{
    private readonly ITicketRepository _repository;

    public TicketService(ITicketRepository repository)
    {
        _repository = repository;
    }

    public Task<List<Ticket>> GetAllAsync() => _repository.GetAllAsync();
    public Task<Ticket?> GetByIdAsync(int id) => _repository.GetByIdAsync(id);
    public Task<List<TicketHistory>> GetHistoryAsync(int id) => _repository.GetHistoryAsync(id);

    public Task<Ticket> CreateAsync(CreateTicketDto dto)
    {
        var priority = dto.Priority.Trim().ToUpperInvariant();
        if (priority is not ("LOW" or "MEDIUM" or "HIGH" or "CRITICAL"))
            throw new BusinessRuleException("Priority must be LOW, MEDIUM, HIGH or CRITICAL.");

        var ticket = new Ticket
        {
            Title = dto.Title.Trim(),
            AssetCode = dto.AssetCode.Trim(),
            Description = dto.Description?.Trim(),
            Priority = priority,
            Status = "PENDING",
            ReportedBy = dto.ReportedBy.Trim(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        return _repository.CreateAsync(ticket, dto.ReportedBy.Trim());
    }

    public async Task<Ticket?> ChangeStatusAsync(int id, ChangeStatusDto dto)
    {
        var ticket = await _repository.GetByIdAsync(id);
        if (ticket is null) return null;

        var newStatus = dto.NewStatus.Trim().ToUpperInvariant();
        var allowed = ticket.Status switch
        {
            "PENDING" => newStatus == "IN_PROGRESS",
            "IN_PROGRESS" => newStatus == "RESOLVED",
            "RESOLVED" => newStatus == "CLOSED",
            _ => false
        };

        if (!allowed)
            throw new BusinessRuleException($"Invalid transition: {ticket.Status} -> {newStatus}.");

        if (newStatus == "IN_PROGRESS" && string.IsNullOrWhiteSpace(dto.Diagnosis))
            throw new BusinessRuleException("A diagnosis is required to start work.");

        if (newStatus == "RESOLVED" && string.IsNullOrWhiteSpace(dto.Resolution))
            throw new BusinessRuleException("A resolution is required to resolve the ticket.");

        return await _repository.ChangeStatusAsync(id, newStatus, dto.Diagnosis, dto.Resolution, dto.PerformedBy, dto.Comment);
    }
}

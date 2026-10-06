using MaintenanceTickets.Api.Entities;

namespace MaintenanceTickets.Api.Repositories;

public interface ITicketRepository
{
    Task<List<Ticket>> GetAllAsync();
    Task<Ticket?> GetByIdAsync(int id);
    Task<Ticket> CreateAsync(Ticket ticket);
    Task<Ticket?> ChangeStatusAsync(int id, string newStatus, string? diagnosis, string? resolution, string performedBy, string? comment);
    Task<List<TicketHistory>> GetHistoryAsync(int ticketId);
}

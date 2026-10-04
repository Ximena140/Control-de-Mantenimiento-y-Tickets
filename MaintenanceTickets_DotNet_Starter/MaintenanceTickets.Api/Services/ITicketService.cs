using MaintenanceTickets.Api.DTOs;
using MaintenanceTickets.Api.Entities;

namespace MaintenanceTickets.Api.Services;

public interface ITicketService
{
    Task<List<Ticket>> GetAllAsync();
    Task<Ticket?> GetByIdAsync(int id);
    Task<Ticket> CreateAsync(CreateTicketDto dto);
    Task<Ticket?> ChangeStatusAsync(int id, ChangeStatusDto dto);
    Task<List<TicketHistory>> GetHistoryAsync(int id);
}

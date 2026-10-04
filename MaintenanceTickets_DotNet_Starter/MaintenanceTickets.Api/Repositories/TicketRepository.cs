using MaintenanceTickets.Api.Data;
using MaintenanceTickets.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace MaintenanceTickets.Api.Repositories;

public class TicketRepository : ITicketRepository
{
    private readonly AppDbContext _context;

    public TicketRepository(AppDbContext context)
    {
        _context = context;
    }

    public Task<List<Ticket>> GetAllAsync() =>
        _context.Tickets.AsNoTracking().OrderByDescending(x => x.CreatedAt).ToListAsync();

    public Task<Ticket?> GetByIdAsync(int id) =>
        _context.Tickets.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);

    public async Task<Ticket> CreateAsync(Ticket ticket, string performedBy)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            _context.Tickets.Add(ticket);
            await _context.SaveChangesAsync();

            _context.TicketHistory.Add(new TicketHistory
            {
                TicketId = ticket.Id,
                EventType = "CREATED",
                ToStatus = "PENDING",
                Comment = "Ticket created",
                PerformedBy = performedBy,
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            return ticket;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<Ticket?> ChangeStatusAsync(int id, string newStatus, string? diagnosis, string? resolution, string performedBy, string? comment)
    {
        // Required by the challenge: the status update + history row are executed in SQL Server.
        await _context.Database.ExecuteSqlInterpolatedAsync($"EXEC sp_TransitionTicketStatus {id}, {newStatus}, {diagnosis}, {resolution}, {performedBy}, {comment}");
        return await GetByIdAsync(id);
    }

    public Task<List<TicketHistory>> GetHistoryAsync(int ticketId) =>
        _context.TicketHistory.AsNoTracking()
            .Where(x => x.TicketId == ticketId)
            .OrderBy(x => x.CreatedAt)
            .ToListAsync();
}

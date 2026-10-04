using MaintenanceTickets.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace MaintenanceTickets.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Ticket> Tickets => Set<Ticket>();
    public DbSet<TicketHistory> TicketHistory => Set<TicketHistory>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Ticket>(entity =>
        {
            entity.ToTable("Tickets");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Title).HasMaxLength(150).IsRequired();
            entity.Property(x => x.AssetCode).HasMaxLength(30).IsRequired();
            entity.Property(x => x.Priority).HasMaxLength(10).IsRequired();
            entity.Property(x => x.Status).HasMaxLength(20).IsRequired();
            entity.Property(x => x.ReportedBy).HasMaxLength(100).IsRequired();
        });

        modelBuilder.Entity<TicketHistory>(entity =>
        {
            entity.ToTable("TicketHistory");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.EventType).HasMaxLength(30).IsRequired();
            entity.Property(x => x.PerformedBy).HasMaxLength(100).IsRequired();

            entity.HasOne(x => x.Ticket)
                .WithMany(x => x.History)
                .HasForeignKey(x => x.TicketId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}

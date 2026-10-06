namespace MaintenanceTickets.Api.Entities;

/// <summary>Ticket statuses, stored as text in Tickets.Status. Flow: PENDING → IN_PROGRESS → RESOLVED.</summary>
public static class TicketStatus
{
    public const string Pending = "PENDING";
    public const string InProgress = "IN_PROGRESS";
    public const string Resolved = "RESOLVED";

    /// <summary>The only status each status can move to. Mirrored by sp_TransitionTicketStatus.</summary>
    private static readonly Dictionary<string, string> NextStatus = new()
    {
        [Pending] = InProgress,
        [InProgress] = Resolved
    };

    public static bool CanTransition(string currentStatus, string newStatus) =>
        NextStatus.TryGetValue(currentStatus, out var allowedStatus) && allowedStatus == newStatus;
}

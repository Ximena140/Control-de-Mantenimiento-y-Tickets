USE MaintenanceTicketsDb;
GO
CREATE OR ALTER PROCEDURE dbo.sp_TransitionTicketStatus
    @TicketId INT,
    @NewStatus VARCHAR(20),
    @Diagnosis NVARCHAR(2000) = NULL,
    @Resolution NVARCHAR(2000) = NULL,
    @PerformedBy NVARCHAR(100),
    @Comment NVARCHAR(2000) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @OldStatus VARCHAR(20);
    SELECT @OldStatus = Status FROM dbo.Tickets WHERE Id = @TicketId;

    IF @OldStatus IS NULL
        THROW 50001, 'Ticket not found.', 1;

    IF NOT (
        (@OldStatus = 'PENDING' AND @NewStatus = 'IN_PROGRESS') OR
        (@OldStatus = 'IN_PROGRESS' AND @NewStatus = 'RESOLVED')
    )
        THROW 50002, 'Invalid ticket status transition.', 1;

    IF @NewStatus = 'IN_PROGRESS' AND NULLIF(LTRIM(RTRIM(@Diagnosis)), '') IS NULL
        THROW 50003, 'Diagnosis is required.', 1;

    IF @NewStatus = 'RESOLVED' AND NULLIF(LTRIM(RTRIM(@Resolution)), '') IS NULL
        THROW 50004, 'Resolution is required.', 1;

    BEGIN TRANSACTION;

    UPDATE dbo.Tickets
    SET Status = @NewStatus,
        Diagnosis = COALESCE(@Diagnosis, Diagnosis),
        Resolution = COALESCE(@Resolution, Resolution),
        UpdatedAt = SYSUTCDATETIME()
    WHERE Id = @TicketId;

    INSERT INTO dbo.TicketHistory
        (TicketId, EventType, FromStatus, ToStatus, Comment, PerformedBy, CreatedAt)
    VALUES
        (@TicketId, 'STATUS_CHANGED', @OldStatus, @NewStatus,
         COALESCE(@Comment, @Diagnosis, @Resolution), @PerformedBy, SYSUTCDATETIME());

    COMMIT TRANSACTION;
END;
GO

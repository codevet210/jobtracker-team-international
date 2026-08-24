namespace JobTracker.Modules.Jobs.IntegrationEvents;

/// <summary>
/// Public contract (Open Host Service) consumed by other bounded contexts.
/// Domain events stay inside the Jobs module. Integration events cross
/// module boundaries and are the only type Billing/Notifications may depend on.
/// </summary>
public sealed record JobCompletedIntegrationEvent(
    Guid EventId,
    Guid JobId,
    Guid OrganizationId,
    Guid CustomerId,
    DateTimeOffset CompletedAt,
    DateTimeOffset OccurredOnUtc);

using JobTracker.SharedKernel.Domain;

namespace JobTracker.Modules.Jobs.Domain.Events;

public sealed record JobCompletedDomainEvent(
    Guid JobId,
    Guid OrganizationId,
    Guid CustomerId,
    DateTimeOffset CompletedAt)
    : DomainEvent;
using JobTracker.SharedKernel.Domain;

namespace JobTracker.Modules.Jobs.Domain.Events;

public sealed record JobCreatedDomainEvent(
    Guid JobId,
    Guid OrganizationId)
    : DomainEvent;
using JobTracker.Modules.Jobs.Domain.Jobs;

namespace JobTracker.Modules.Jobs.Domain.Repositories;

public sealed record JobSearchCriteria(
    Guid OrganizationId,
    IReadOnlyCollection<JobStatus>? Statuses,
    DateTimeOffset? From,
    DateTimeOffset? To,
    Guid? AssigneeId,
    string? SearchTerm,
    int Page,
    int PageSize);

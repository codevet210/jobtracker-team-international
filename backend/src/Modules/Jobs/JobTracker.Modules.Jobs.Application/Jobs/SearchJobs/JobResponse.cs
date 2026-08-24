using JobTracker.Modules.Jobs.Domain.Jobs;

namespace JobTracker.Modules.Jobs.Application.Jobs.SearchJobs;

public sealed record JobResponse(
    Guid Id,
    string Title,
    string Description,
    JobStatus Status,
    string Street,
    string City,
    string State,
    string ZipCode,
    decimal? Latitude,
    decimal? Longitude,
    DateTimeOffset? ScheduledDate,
    Guid? AssigneeId,
    Guid CustomerId,
    Guid OrganizationId,
    DateTimeOffset? StartedAt,
    DateTimeOffset? CompletedAt,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    int PhotoCount);

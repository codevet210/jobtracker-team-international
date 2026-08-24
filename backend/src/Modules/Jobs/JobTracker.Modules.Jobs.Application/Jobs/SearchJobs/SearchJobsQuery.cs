using JobTracker.Modules.Jobs.Domain.Jobs;
using JobTracker.SharedKernel.Application;
using MediatR;

namespace JobTracker.Modules.Jobs.Application.Jobs.SearchJobs;

public sealed record SearchJobsQuery(
    Guid OrganizationId,
    IReadOnlyCollection<JobStatus>? Statuses,
    DateTimeOffset? From,
    DateTimeOffset? To,
    Guid? AssigneeId,
    string? SearchTerm,
    int Page = 1,
    int PageSize = 20)
    : IRequest<Result<PagedList<JobResponse>>>;

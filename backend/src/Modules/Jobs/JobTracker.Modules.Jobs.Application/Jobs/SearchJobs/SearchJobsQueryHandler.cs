using JobTracker.Modules.Jobs.Application.Abstractions;
using JobTracker.Modules.Jobs.Domain.Repositories;
using JobTracker.SharedKernel.Application;
using MediatR;

namespace JobTracker.Modules.Jobs.Application.Jobs.SearchJobs;

internal sealed class SearchJobsQueryHandler
    : IRequestHandler<SearchJobsQuery, Result<PagedList<JobResponse>>>
{
    private readonly IJobReadRepository _jobReadRepository;

    public SearchJobsQueryHandler(IJobReadRepository jobReadRepository)
    {
        _jobReadRepository = jobReadRepository;
    }

    public async Task<Result<PagedList<JobResponse>>> Handle(
        SearchJobsQuery query,
        CancellationToken cancellationToken)
    {
        var criteria = new JobSearchCriteria(
            query.OrganizationId,
            query.Statuses,
            query.From,
            query.To,
            query.AssigneeId,
            query.SearchTerm,
            query.Page,
            query.PageSize);

        var page = await _jobReadRepository.SearchAsync(
            criteria,
            cancellationToken);

        return Result<PagedList<JobResponse>>.Success(page);
    }
}

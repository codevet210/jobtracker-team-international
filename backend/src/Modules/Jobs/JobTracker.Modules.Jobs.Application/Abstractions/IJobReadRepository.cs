using JobTracker.Modules.Jobs.Application.Jobs.SearchJobs;
using JobTracker.Modules.Jobs.Domain.Repositories;
using JobTracker.SharedKernel.Application;

namespace JobTracker.Modules.Jobs.Application.Abstractions;

public interface IJobReadRepository
{
    Task<PagedList<JobResponse>> SearchAsync(
        JobSearchCriteria criteria,
        CancellationToken cancellationToken = default);
}

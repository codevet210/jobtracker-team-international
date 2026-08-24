using JobTracker.Modules.Jobs.Domain.Jobs;

namespace JobTracker.Modules.Jobs.Domain.Repositories;

public interface IJobRepository
{
    Task<Job?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    Task AddAsync(
        Job job,
        CancellationToken cancellationToken = default);

    Task<(IReadOnlyList<Job> Items, int TotalCount)> SearchAsync(
        JobSearchCriteria criteria,
        CancellationToken cancellationToken = default);
}
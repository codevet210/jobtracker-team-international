using JobTracker.Modules.Jobs.Application.Abstractions;
using JobTracker.Modules.Jobs.Domain.Jobs;
using JobTracker.Modules.Jobs.Domain.Repositories;
using JobTracker.Modules.Jobs.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Modules.Jobs.Infrastructure.Persistence.Repositories;

internal sealed partial class JobRepository : IJobRepository, IJobReadRepository
{
    private readonly JobsDbContext _dbContext;

    public JobRepository(JobsDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Job?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.Jobs
            .Include(job => job.Photos)
            .FirstOrDefaultAsync(job => job.Id == id, cancellationToken);
    }

    public async Task AddAsync(
        Job job,
        CancellationToken cancellationToken = default)
    {
        await _dbContext.Jobs.AddAsync(job, cancellationToken);
    }
}

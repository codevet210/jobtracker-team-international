using JobTracker.Modules.Jobs.Application.Abstractions;
using JobTracker.Modules.Jobs.Application.Jobs.SearchJobs;
using JobTracker.Modules.Jobs.Domain.Jobs;
using JobTracker.Modules.Jobs.Domain.Repositories;
using JobTracker.SharedKernel.Application;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Modules.Jobs.Infrastructure.Persistence.Repositories;

internal sealed partial class JobRepository
{
    public async Task<(IReadOnlyList<Job> Items, int TotalCount)> SearchAsync(
        JobSearchCriteria criteria,
        CancellationToken cancellationToken = default)
    {
        var query = ApplyFilters(_dbContext.Jobs.AsNoTracking(), criteria);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(job => job.CreatedAt)
            .ThenBy(job => job.Id)
            .Skip((criteria.Page - 1) * criteria.PageSize)
            .Take(criteria.PageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    async Task<PagedList<JobResponse>> IJobReadRepository.SearchAsync(
        JobSearchCriteria criteria,
        CancellationToken cancellationToken)
    {
        var query = ApplyFilters(_dbContext.Jobs.AsNoTracking(), criteria);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(job => job.CreatedAt)
            .ThenBy(job => job.Id)
            .Skip((criteria.Page - 1) * criteria.PageSize)
            .Take(criteria.PageSize)
            .Select(job => new JobResponse(
                job.Id,
                job.Title,
                job.Description,
                job.Status,
                job.Address.Street,
                job.Address.City,
                job.Address.State,
                job.Address.ZipCode,
                job.Address.Latitude,
                job.Address.Longitude,
                job.ScheduledDate,
                job.AssigneeId,
                job.CustomerId,
                job.OrganizationId,
                job.StartedAt,
                job.CompletedAt,
                job.CreatedAt,
                job.UpdatedAt,
                job.Photos.Count))
            .ToListAsync(cancellationToken);

        return new PagedList<JobResponse>(
            items,
            criteria.Page,
            criteria.PageSize,
            totalCount);
    }

    private static IQueryable<Job> ApplyFilters(
        IQueryable<Job> query,
        JobSearchCriteria criteria)
    {
        query = query.Where(job => job.OrganizationId == criteria.OrganizationId);

        if (criteria.Statuses is { Count: > 0 })
        {
            query = query.Where(job => criteria.Statuses.Contains(job.Status));
        }

        if (criteria.From is not null)
        {
            query = query.Where(job => job.ScheduledDate >= criteria.From);
        }

        if (criteria.To is not null)
        {
            query = query.Where(job => job.ScheduledDate <= criteria.To);
        }

        if (criteria.AssigneeId is not null)
        {
            query = query.Where(job => job.AssigneeId == criteria.AssigneeId);
        }

        if (!string.IsNullOrWhiteSpace(criteria.SearchTerm))
        {
            var term = criteria.SearchTerm.Trim();
            query = query.Where(job =>
                EF.Functions.ILike(job.Title, $"%{term}%")
                || EF.Functions.ILike(job.Description, $"%{term}%"));
        }

        return query;
    }
}

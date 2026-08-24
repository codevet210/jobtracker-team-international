using JobTracker.Modules.Jobs.Application.Jobs.CompleteJob;
using JobTracker.Modules.Jobs.Application.Jobs.CreateJob;
using JobTracker.Modules.Jobs.Application.Jobs.ScheduleJob;
using JobTracker.Modules.Jobs.Application.Jobs.SearchJobs;
using JobTracker.Modules.Jobs.Application.Jobs.StartJob;
using JobTracker.Modules.Jobs.Domain.Jobs;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace JobTracker.Modules.Jobs.Presentation;

public static class JobsEndpoints
{
    public const string OrganizationHeader = "X-Organization-Id";

    public static IEndpointRouteBuilder MapJobsEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/jobs")
            .WithTags("Jobs");

        group.MapGet("/", SearchJobs)
            .WithName("SearchJobs");

        group.MapPost("/", CreateJob)
            .WithName("CreateJob");

        group.MapPost("/{jobId:guid}/schedule", ScheduleJob)
            .WithName("ScheduleJob");

        group.MapPost("/{jobId:guid}/start", StartJob)
            .WithName("StartJob");

        group.MapPost("/{jobId:guid}/complete", CompleteJob)
            .WithName("CompleteJob");

        return endpoints;
    }

    private static async Task<IResult> SearchJobs(
        [FromServices] ISender sender,
        [FromHeader(Name = OrganizationHeader)] Guid organizationId,
        [FromQuery] JobStatus[]? statuses,
        [FromQuery] DateTimeOffset? from,
        [FromQuery] DateTimeOffset? to,
        [FromQuery] Guid? assigneeId,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await sender.Send(
            new SearchJobsQuery(
                organizationId,
                statuses,
                from,
                to,
                assigneeId,
                search,
                page,
                pageSize),
            cancellationToken);

        return result.ToHttpResult(Results.Ok);
    }

    private static async Task<IResult> CreateJob(
        [FromServices] ISender sender,
        [FromHeader(Name = OrganizationHeader)] Guid organizationId,
        [FromBody] CreateJobRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new CreateJobCommand(
                request.Title,
                request.Description,
                request.Street,
                request.City,
                request.State,
                request.ZipCode,
                request.Latitude,
                request.Longitude,
                request.CustomerId,
                organizationId),
            cancellationToken);

        return result.ToHttpResult(id =>
            Results.Created($"/api/jobs/{id}", new { id }));
    }

    private static async Task<IResult> ScheduleJob(
        [FromServices] ISender sender,
        Guid jobId,
        [FromBody] ScheduleJobRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new ScheduleJobCommand(jobId, request.ScheduledDate, request.AssigneeId),
            cancellationToken);

        return result.ToHttpResult();
    }

    private static async Task<IResult> StartJob(
        [FromServices] ISender sender,
        Guid jobId,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new StartJobCommand(jobId, DateTimeOffset.UtcNow),
            cancellationToken);

        return result.ToHttpResult();
    }

    private static async Task<IResult> CompleteJob(
        [FromServices] ISender sender,
        Guid jobId,
        [FromBody] CompleteJobRequest? request,
        CancellationToken cancellationToken)
    {
        var completedAt = request?.CompletedAt ?? DateTimeOffset.UtcNow;

        var result = await sender.Send(
            new CompleteJobCommand(jobId, completedAt),
            cancellationToken);

        return result.ToHttpResult();
    }
}

public sealed record CreateJobRequest(
    string Title,
    string Description,
    string Street,
    string City,
    string State,
    string ZipCode,
    decimal? Latitude,
    decimal? Longitude,
    Guid CustomerId);

public sealed record ScheduleJobRequest(
    DateTimeOffset ScheduledDate,
    Guid AssigneeId);

public sealed record CompleteJobRequest(DateTimeOffset? CompletedAt);

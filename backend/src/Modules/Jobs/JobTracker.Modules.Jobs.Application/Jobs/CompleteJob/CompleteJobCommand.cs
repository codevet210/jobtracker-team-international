using JobTracker.SharedKernel.Application;
using MediatR;

namespace JobTracker.Modules.Jobs.Application.Jobs.CompleteJob;

public sealed record CompleteJobCommand(
    Guid JobId,
    DateTimeOffset CompletedAt)
    : IRequest<Result>;
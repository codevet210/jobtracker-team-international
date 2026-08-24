using JobTracker.SharedKernel.Application;
using MediatR;

namespace JobTracker.Modules.Jobs.Application.Jobs.StartJob;

public sealed record StartJobCommand(
    Guid JobId,
    DateTimeOffset StartedAt)
    : IRequest<Result<Unit>>;

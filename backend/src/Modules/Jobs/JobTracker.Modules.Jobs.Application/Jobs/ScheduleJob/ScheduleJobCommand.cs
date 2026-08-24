using JobTracker.SharedKernel.Application;
using MediatR;

namespace JobTracker.Modules.Jobs.Application.Jobs.ScheduleJob;

public sealed record ScheduleJobCommand(
    Guid JobId,
    DateTimeOffset ScheduledDate,
    Guid AssigneeId)
    : IRequest<Result<Unit>>;

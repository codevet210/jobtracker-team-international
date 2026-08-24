using JobTracker.Modules.Jobs.Domain.Jobs;
using JobTracker.Modules.Jobs.Domain.Repositories;
using JobTracker.SharedKernel.Application;
using MediatR;

namespace JobTracker.Modules.Jobs.Application.Jobs.ScheduleJob;

internal sealed class ScheduleJobCommandHandler
    : IRequestHandler<ScheduleJobCommand, Result<Unit>>
{
    private readonly IJobRepository _jobRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ScheduleJobCommandHandler(
        IJobRepository jobRepository,
        IUnitOfWork unitOfWork)
    {
        _jobRepository = jobRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Unit>> Handle(
        ScheduleJobCommand command,
        CancellationToken cancellationToken)
    {
        var job = await _jobRepository.GetByIdAsync(
            command.JobId,
            cancellationToken);

        if (job is null)
        {
            return Result<Unit>.Failure(
                JobErrors.NotFound(command.JobId));
        }

        try
        {
            job.Schedule(command.ScheduledDate, command.AssigneeId);
        }
        catch (InvalidOperationException exception)
        {
            return Result<Unit>.Failure(
                JobErrors.InvalidTransition(exception.Message));
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<Unit>.Success(Unit.Value);
    }
}

using JobTracker.Modules.Jobs.Domain.Jobs;
using JobTracker.Modules.Jobs.Domain.Repositories;
using JobTracker.SharedKernel.Application;
using MediatR;

namespace JobTracker.Modules.Jobs.Application.Jobs.StartJob;

internal sealed class StartJobCommandHandler
    : IRequestHandler<StartJobCommand, Result<Unit>>
{
    private readonly IJobRepository _jobRepository;
    private readonly IUnitOfWork _unitOfWork;

    public StartJobCommandHandler(
        IJobRepository jobRepository,
        IUnitOfWork unitOfWork)
    {
        _jobRepository = jobRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Unit>> Handle(
        StartJobCommand command,
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
            job.Start(command.StartedAt);
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

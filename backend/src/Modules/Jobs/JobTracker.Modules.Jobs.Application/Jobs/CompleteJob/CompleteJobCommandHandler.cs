using JobTracker.Modules.Jobs.Domain.Jobs;
using JobTracker.Modules.Jobs.Domain.Repositories;
using JobTracker.SharedKernel.Application;
using MediatR;

namespace JobTracker.Modules.Jobs.Application.Jobs.CompleteJob;

internal sealed class CompleteJobCommandHandler
    : IRequestHandler<CompleteJobCommand, Result>
{
    private readonly IJobRepository _jobRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CompleteJobCommandHandler(
        IJobRepository jobRepository,
        IUnitOfWork unitOfWork)
    {
        _jobRepository = jobRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(
        CompleteJobCommand command,
        CancellationToken cancellationToken)
    {
        var job = await _jobRepository.GetByIdAsync(
            command.JobId,
            cancellationToken);

        if (job is null)
        {
            return Result.Failure(
                JobErrors.NotFound(command.JobId));
        }

        job.Complete(command.CompletedAt);

        await _unitOfWork.SaveChangesAsync(
            cancellationToken);

        return Result.Success();
    }
}
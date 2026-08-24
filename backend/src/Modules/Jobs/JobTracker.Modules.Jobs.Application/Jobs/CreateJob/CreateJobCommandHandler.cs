using MediatR;
using JobTracker.Modules.Jobs.Domain.Jobs;
using JobTracker.Modules.Jobs.Domain.Repositories;
using JobTracker.SharedKernel.Application;

namespace JobTracker.Modules.Jobs.Application.Jobs.CreateJob;

internal sealed class CreateJobCommandHandler
    : IRequestHandler<CreateJobCommand, Result<Guid>>
{
    private readonly IJobRepository _jobRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateJobCommandHandler(
        IJobRepository jobRepository,
        IUnitOfWork unitOfWork)
    {
        _jobRepository = jobRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Guid>> Handle(
        CreateJobCommand command,
        CancellationToken cancellationToken)
    {
        var address = new Address(
            command.Street,
            command.City,
            command.State,
            command.ZipCode,
            command.Latitude,
            command.Longitude);

        var job = Job.Create(
            command.Title,
            command.Description,
            address,
            command.CustomerId,
            command.OrganizationId);

        await _jobRepository.AddAsync(
            job,
            cancellationToken);

        await _unitOfWork.SaveChangesAsync(
            cancellationToken);

        return Result<Guid>.Success(job.Id);
    }
}
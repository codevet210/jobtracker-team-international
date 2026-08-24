using JobTracker.Modules.Jobs.Application.Jobs.CreateJob;
using JobTracker.Modules.Jobs.Domain.Jobs;
using JobTracker.Modules.Jobs.Domain.Repositories;
using JobTracker.SharedKernel.Application;
using Moq;
using FluentAssertions;

namespace JobTracker.UnitTests.Application;

public sealed class CreateJobCommandHandlerTests
{
    [Fact]
    public async Task Handle_persists_job_and_raises_created_event()
    {
        var repository = new Mock<IJobRepository>();
        var unitOfWork = new Mock<IUnitOfWork>();
        Job? captured = null;

        repository
            .Setup(item => item.AddAsync(It.IsAny<Job>(), It.IsAny<CancellationToken>()))
            .Callback<Job, CancellationToken>((job, _) => captured = job)
            .Returns(Task.CompletedTask);

        unitOfWork
            .Setup(item => item.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        var handler = new CreateJobCommandHandler(
            repository.Object,
            unitOfWork.Object);

        var command = new CreateJobCommand(
            "Replace shingles",
            "North slope leak",
            "1 Main St",
            "Austin",
            "TX",
            "78701",
            30.27m,
            -97.74m,
            Guid.NewGuid(),
            Guid.NewGuid());

        var result = await handler.Handle(command, CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value.Should().Be(captured!.Id);
        captured.DomainEvents.Should().ContainSingle(domainEvent =>
            domainEvent.GetType().Name == "JobCreatedDomainEvent");
        repository.Verify(
            item => item.AddAsync(It.IsAny<Job>(), It.IsAny<CancellationToken>()),
            Times.Once);
        unitOfWork.Verify(
            item => item.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Once);
    }
}

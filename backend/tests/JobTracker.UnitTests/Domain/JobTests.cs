using JobTracker.Modules.Jobs.Domain.Jobs;
using FluentAssertions;

namespace JobTracker.UnitTests.Domain;

public sealed class JobTests
{
    [Fact]
    public void Create_raises_job_created_domain_event()
    {
        var job = CreateDraft();

        job.Status.Should().Be(JobStatus.Draft);
        job.DomainEvents.Should().ContainSingle(domainEvent =>
            domainEvent.GetType().Name == "JobCreatedDomainEvent");
    }

    [Fact]
    public void Schedule_rejects_dates_in_the_past()
    {
        var job = CreateDraft();

        var act = () => job.Schedule(
            DateTimeOffset.UtcNow.AddMinutes(-1),
            Guid.NewGuid());

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*past*");
    }

    [Fact]
    public void Schedule_moves_draft_to_scheduled()
    {
        var job = CreateDraft();
        var assigneeId = Guid.NewGuid();
        var scheduledDate = DateTimeOffset.UtcNow.AddDays(1);

        job.Schedule(scheduledDate, assigneeId);

        job.Status.Should().Be(JobStatus.Scheduled);
        job.AssigneeId.Should().Be(assigneeId);
        job.ScheduledDate.Should().Be(scheduledDate);
    }

    [Fact]
    public void Start_requires_scheduled_status()
    {
        var job = CreateDraft();

        var act = () => job.Start(DateTimeOffset.UtcNow);

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*scheduled*");
    }

    [Fact]
    public void Complete_requires_in_progress_status()
    {
        var job = CreateDraft();

        var act = () => job.Complete(DateTimeOffset.UtcNow);

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*in progress*");
    }

    [Fact]
    public void Complete_raises_job_completed_domain_event()
    {
        var job = CreateInProgress();

        job.Complete(DateTimeOffset.UtcNow);

        job.Status.Should().Be(JobStatus.Completed);
        job.DomainEvents.Should().Contain(domainEvent =>
            domainEvent.GetType().Name == "JobCompletedDomainEvent");
    }

    [Fact]
    public void Completed_jobs_cannot_be_scheduled()
    {
        var job = CreateInProgress();
        job.Complete(DateTimeOffset.UtcNow);

        var act = () => job.Schedule(
            DateTimeOffset.UtcNow.AddDays(1),
            Guid.NewGuid());

        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void Cancelled_jobs_cannot_transition()
    {
        var job = CreateDraft();
        job.Cancel("Customer postponed");

        var act = () => job.Start(DateTimeOffset.UtcNow);

        act.Should().Throw<InvalidOperationException>();
    }

    private static Job CreateDraft()
    {
        return Job.Create(
            "Replace shingles",
            "North slope leak",
            new Address("1 Main St", "Austin", "TX", "78701", 30.27m, -97.74m),
            Guid.NewGuid(),
            Guid.NewGuid());
    }

    private static Job CreateInProgress()
    {
        var job = CreateDraft();
        job.Schedule(DateTimeOffset.UtcNow.AddDays(1), Guid.NewGuid());
        job.Start(DateTimeOffset.UtcNow);
        return job;
    }
}

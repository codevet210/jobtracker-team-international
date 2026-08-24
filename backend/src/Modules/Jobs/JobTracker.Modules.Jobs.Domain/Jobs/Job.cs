using JobTracker.Modules.Jobs.Domain.Events;
using JobTracker.SharedKernel.Domain;

namespace JobTracker.Modules.Jobs.Domain.Jobs;

public sealed class Job : AggregateRoot
{
    private readonly List<JobPhoto> _photos = [];

    private Job()
        : base(Guid.Empty)
    {
    }

    private Job(Guid id)
        : base(id)
    {
    }

    public static Job Create(
    string title,
    string description,
    Address address,
    Guid customerId,
    Guid organizationId)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(title);
        ArgumentNullException.ThrowIfNull(address);

        var job = new Job(Guid.NewGuid())
        {
            Title = title,
            Description = description,
            Address = address,
            CustomerId = customerId,
            OrganizationId = organizationId,
            Status = JobStatus.Draft,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        job.RaiseDomainEvent(
            new JobCreatedDomainEvent(
                job.Id,
                organizationId));

        return job;
    }

    public void Schedule(
    DateTimeOffset scheduledDate,
    Guid assigneeId)
    {
        if (Status is JobStatus.Completed or JobStatus.Cancelled)
        {
            throw new InvalidOperationException(
                "Completed or cancelled jobs cannot be scheduled.");
        }

        if (scheduledDate <= DateTimeOffset.UtcNow)
        {
            throw new InvalidOperationException(
                "A job cannot be scheduled in the past.");
        }

        ScheduledDate = scheduledDate;
        AssigneeId = assigneeId;
        Status = JobStatus.Scheduled;
        Touch();
    }

    public void Start(DateTimeOffset startedAt)
    {
        if (Status != JobStatus.Scheduled)
        {
            throw new InvalidOperationException(
                "Only scheduled jobs can be started.");
        }

        StartedAt = startedAt;
        Status = JobStatus.InProgress;
        Touch();
    }

    public void AddPhoto(
    string url,
    DateTimeOffset capturedAt,
    string? caption)
    {
        if (Status is JobStatus.Completed or JobStatus.Cancelled)
        {
            throw new InvalidOperationException(
                "Photos cannot be added to a completed or cancelled job.");
        }

        var photo = JobPhoto.Create(
            url,
            capturedAt,
            caption);

        _photos.Add(photo);
        Touch();
    }

    public void Complete(
    DateTimeOffset completedAt)
    {
        if (Status != JobStatus.InProgress)
        {
            throw new InvalidOperationException(
                "Only jobs in progress can be completed.");
        }

        Status = JobStatus.Completed;
        CompletedAt = completedAt;
        Touch();

        RaiseDomainEvent(
            new JobCompletedDomainEvent(
                Id,
                OrganizationId,
                CustomerId,
                completedAt));
    }

    public void Cancel(string reason)
    {
        if (Status is JobStatus.Completed or JobStatus.Cancelled)
        {
            throw new InvalidOperationException(
                "Completed or cancelled jobs cannot transition.");
        }

        ArgumentException.ThrowIfNullOrWhiteSpace(reason);

        Status = JobStatus.Cancelled;
        Touch();

        RaiseDomainEvent(
            new JobCancelledDomainEvent(
                Id,
                OrganizationId,
                reason));
    }

    public string Title { get; private set; } = null!;

    public string Description { get; private set; } = null!;

    public Address Address { get; private set; } = null!;

    public JobStatus Status { get; private set; }

    public DateTimeOffset? ScheduledDate { get; private set; }

    public Guid? AssigneeId { get; private set; }

    public Guid CustomerId { get; private set; }

    public Guid OrganizationId { get; private set; }

    public DateTimeOffset? StartedAt { get; private set; }

    public DateTimeOffset? CompletedAt { get; private set; }

    public DateTimeOffset CreatedAt { get; private set; }

    public DateTimeOffset UpdatedAt { get; private set; }

    public IReadOnlyCollection<JobPhoto> Photos =>
        _photos.AsReadOnly();

    private void Touch()
    {
        UpdatedAt = DateTimeOffset.UtcNow;
    }
}
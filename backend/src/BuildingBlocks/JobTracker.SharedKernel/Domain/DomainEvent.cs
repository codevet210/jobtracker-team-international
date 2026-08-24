namespace JobTracker.SharedKernel.Domain;

public abstract class DomainEvent : IDomainEvent
{
    public Guid Id { get; }
    public DateTimeOffset OccurredOnUtc { get; }

    protected DomainEvent()
    {
        Id = Guid.NewGuid();
        OccurredOnUtc = DateTimeOffset.UtcNow;
    }
}
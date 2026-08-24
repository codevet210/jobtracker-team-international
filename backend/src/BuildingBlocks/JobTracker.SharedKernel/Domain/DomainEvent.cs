namespace JobTracker.SharedKernel.Domain;

public abstract record DomainEvent : IDomainEvent
{
    public Guid Id { get; }
    public DateTimeOffset OccurredOnUtc { get; }

    protected DomainEvent()
    {
        Id = Guid.NewGuid();
        OccurredOnUtc = DateTimeOffset.UtcNow;
    }
}
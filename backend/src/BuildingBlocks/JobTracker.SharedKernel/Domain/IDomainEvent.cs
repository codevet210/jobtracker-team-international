namespace JobTracker.SharedKernel.Domain;

public interface IDomainEvent
{
    Guid Id { get; }
    DateTimeOffset OccurredOnUtc { get; }
}
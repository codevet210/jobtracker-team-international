namespace JobTracker.Modules.Jobs.IntegrationEvents;

public interface IGenerateInvoiceJob
{
    Task Execute(
        Guid jobId,
        Guid customerId,
        Guid organizationId,
        DateTimeOffset completedAt,
        CancellationToken cancellationToken = default);
}

public interface INotifyCustomerJob
{
    Task Execute(
        Guid jobId,
        Guid customerId,
        Guid organizationId,
        DateTimeOffset completedAt,
        CancellationToken cancellationToken = default);
}

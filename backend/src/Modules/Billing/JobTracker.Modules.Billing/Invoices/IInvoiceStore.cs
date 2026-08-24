using JobTracker.Modules.Jobs.IntegrationEvents;

namespace JobTracker.Modules.Billing.Invoices;

/// <summary>
/// Invoice generation is idempotent: the unique key is JobId + CompletedAt.
/// Replaying the same integration event (at-least-once outbox delivery)
/// hits ON CONFLICT DO NOTHING and does not create a duplicate invoice.
/// </summary>
public interface IInvoiceStore
{
    Task<bool> TryCreateInvoiceAsync(
        Guid jobId,
        Guid customerId,
        Guid organizationId,
        DateTimeOffset completedAt,
        CancellationToken cancellationToken = default);
}

using JobTracker.Modules.Jobs.IntegrationEvents;
using Microsoft.Extensions.Logging;

namespace JobTracker.Modules.Billing.Invoices;

internal sealed class GenerateInvoiceJob : IGenerateInvoiceJob
{
    private readonly IInvoiceStore _invoiceStore;
    private readonly ILogger<GenerateInvoiceJob> _logger;

    public GenerateInvoiceJob(
        IInvoiceStore invoiceStore,
        ILogger<GenerateInvoiceJob> logger)
    {
        _invoiceStore = invoiceStore;
        _logger = logger;
    }

    public async Task Execute(
        Guid jobId,
        Guid customerId,
        Guid organizationId,
        DateTimeOffset completedAt,
        CancellationToken cancellationToken = default)
    {
        var created = await _invoiceStore.TryCreateInvoiceAsync(
            jobId,
            customerId,
            organizationId,
            completedAt,
            cancellationToken);

        if (!created)
        {
            _logger.LogInformation(
                "Invoice for job {JobId} at {CompletedAt} already exists; skipping duplicate.",
                jobId,
                completedAt);
            return;
        }

        _logger.LogInformation(
            "Generated invoice for job {JobId} in organization {OrganizationId}.",
            jobId,
            organizationId);
    }
}

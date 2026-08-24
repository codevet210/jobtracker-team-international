using JobTracker.Modules.Jobs.IntegrationEvents;
using Microsoft.Extensions.Logging;

namespace JobTracker.Modules.Notifications;

/// <summary>
/// Production would call SendGrid here. The stub keeps the take-home runnable
/// without API keys while preserving the same job contract and idempotent
/// message key (JobId + CompletedAt).
/// </summary>
internal sealed class NotifyCustomerJob : INotifyCustomerJob
{
    private readonly ILogger<NotifyCustomerJob> _logger;
    private readonly HashSet<string> _sent = [];
    private readonly object _lock = new();

    public NotifyCustomerJob(ILogger<NotifyCustomerJob> logger)
    {
        _logger = logger;
    }

    public Task Execute(
        Guid jobId,
        Guid customerId,
        Guid organizationId,
        DateTimeOffset completedAt,
        CancellationToken cancellationToken = default)
    {
        var idempotencyKey = $"{jobId:N}:{completedAt.UtcDateTime:O}";

        lock (_lock)
        {
            if (!_sent.Add(idempotencyKey))
            {
                _logger.LogInformation(
                    "Skipping duplicate customer notification for job {JobId}.",
                    jobId);
                return Task.CompletedTask;
            }
        }

        _logger.LogInformation(
            "SendGrid stub: notified customer {CustomerId} that job {JobId} was completed.",
            customerId,
            jobId);

        return Task.CompletedTask;
    }
}

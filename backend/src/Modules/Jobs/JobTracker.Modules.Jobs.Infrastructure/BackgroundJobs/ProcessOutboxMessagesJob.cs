using System.Text.Json;
using Hangfire;
using JobTracker.Modules.Jobs.Infrastructure.Persistence;
using JobTracker.Modules.Jobs.Infrastructure.Persistence.Outbox;
using JobTracker.Modules.Jobs.IntegrationEvents;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace JobTracker.Modules.Jobs.Infrastructure.BackgroundJobs;

internal sealed class ProcessOutboxMessagesJob
{
    private readonly JobsDbContext _dbContext;
    private readonly IBackgroundJobClient _backgroundJobs;
    private readonly ILogger<ProcessOutboxMessagesJob> _logger;

    public ProcessOutboxMessagesJob(
        JobsDbContext dbContext,
        IBackgroundJobClient backgroundJobs,
        ILogger<ProcessOutboxMessagesJob> logger)
    {
        _dbContext = dbContext;
        _backgroundJobs = backgroundJobs;
        _logger = logger;
    }

    [DisableConcurrentExecution(timeoutInSeconds: 60)]
    public async Task Execute(CancellationToken cancellationToken)
    {
        var messages = await _dbContext.OutboxMessages
            .Where(message => message.ProcessedOnUtc == null)
            .OrderBy(message => message.OccurredOnUtc)
            .Take(20)
            .ToListAsync(cancellationToken);

        foreach (var message in messages)
        {
            try
            {
                Dispatch(message);
                message.ProcessedOnUtc = DateTimeOffset.UtcNow;
                message.Error = null;
            }
            catch (Exception exception)
            {
                message.Error = exception.Message;
                _logger.LogError(
                    exception,
                    "Failed to dispatch outbox message {MessageId}",
                    message.Id);
            }
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private void Dispatch(OutboxMessage message)
    {
        var integrationEventName = typeof(JobCompletedIntegrationEvent).AssemblyQualifiedName;

        if (message.Type != integrationEventName)
        {
            return;
        }

        var integrationEvent = JsonSerializer.Deserialize<JobCompletedIntegrationEvent>(
            message.Content,
            new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

        if (integrationEvent is null)
        {
            throw new InvalidOperationException("Outbox payload could not be deserialized.");
        }

        _backgroundJobs.Enqueue<IGenerateInvoiceJob>(job =>
            job.Execute(
                integrationEvent.JobId,
                integrationEvent.CustomerId,
                integrationEvent.OrganizationId,
                integrationEvent.CompletedAt,
                CancellationToken.None));

        _backgroundJobs.Enqueue<INotifyCustomerJob>(job =>
            job.Execute(
                integrationEvent.JobId,
                integrationEvent.CustomerId,
                integrationEvent.OrganizationId,
                integrationEvent.CompletedAt,
                CancellationToken.None));
    }
}

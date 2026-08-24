using System.Text.Json;
using JobTracker.Modules.Jobs.Domain.Events;
using JobTracker.Modules.Jobs.Infrastructure.Persistence.Outbox;
using JobTracker.Modules.Jobs.IntegrationEvents;
using JobTracker.SharedKernel.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace JobTracker.Modules.Jobs.Infrastructure.Persistence.Outbox;

/// <summary>
/// Converts raised domain events into outbox rows in the same SaveChanges
/// transaction. The outbox is the source of at-least-once delivery: if the
/// process crashes after commit, Hangfire will retry unpublished rows until
/// ProcessedOnUtc is set.
/// </summary>
internal sealed class InsertOutboxMessagesInterceptor : SaveChangesInterceptor
{
    private static readonly JsonSerializerOptions SerializerOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        if (eventData.Context is not null)
        {
            InsertOutboxMessages(eventData.Context);
        }

        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    public override InterceptionResult<int> SavingChanges(
        DbContextEventData eventData,
        InterceptionResult<int> result)
    {
        if (eventData.Context is not null)
        {
            InsertOutboxMessages(eventData.Context);
        }

        return base.SavingChanges(eventData, result);
    }

    private static void InsertOutboxMessages(DbContext context)
    {
        var domainEvents = context.ChangeTracker
            .Entries()
            .Select(entry => entry.Entity)
            .OfType<Entity>()
            .SelectMany(entity =>
            {
                var events = entity.DomainEvents.ToList();
                entity.ClearDomainEvents();
                return events;
            })
            .ToList();

        if (domainEvents.Count == 0)
        {
            return;
        }

        var messages = domainEvents
            .SelectMany(ToOutboxMessages)
            .ToList();

        context.Set<OutboxMessage>().AddRange(messages);
    }

    private static IEnumerable<OutboxMessage> ToOutboxMessages(IDomainEvent domainEvent)
    {
        yield return new OutboxMessage
        {
            Id = domainEvent.Id,
            Type = domainEvent.GetType().AssemblyQualifiedName
                ?? domainEvent.GetType().Name,
            Content = JsonSerializer.Serialize(domainEvent, domainEvent.GetType(), SerializerOptions),
            OccurredOnUtc = domainEvent.OccurredOnUtc
        };

        if (domainEvent is JobCompletedDomainEvent completed)
        {
            var integrationEvent = new JobCompletedIntegrationEvent(
                completed.Id,
                completed.JobId,
                completed.OrganizationId,
                completed.CustomerId,
                completed.CompletedAt,
                completed.OccurredOnUtc);

            yield return new OutboxMessage
            {
                Id = Guid.NewGuid(),
                Type = typeof(JobCompletedIntegrationEvent).AssemblyQualifiedName
                    ?? typeof(JobCompletedIntegrationEvent).Name,
                Content = JsonSerializer.Serialize(integrationEvent, SerializerOptions),
                OccurredOnUtc = completed.OccurredOnUtc
            };
        }
    }
}

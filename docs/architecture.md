# JobTracker architecture

```
┌─────────────────────────────────────────────────────────────────┐
│ Next.js App Router                                              │
│  Server Components (page.tsx + server-only + DI use case)       │
│       │ props                                                   │
│  Client leaves ('use client' organisms)                         │
│       │ hooks / Zustand selectors                               │
│  Server Actions ──mutations only──► POST /api/jobs[...]         │
└───────────────────────────────┬─────────────────────────────────┘
                                │ HTTP + X-Organization-Id
┌───────────────────────────────▼─────────────────────────────────┐
│ JobTracker.Api  (composition root)                              │
│  CORS, exception handler, Hangfire dashboard                    │
│  Presentation ──MediatR──► Application ──► Domain               │
│                    │                      ▲                     │
│                    └── Infrastructure ────┘                     │
│                         EF Core JobsDbContext (schema jobs)     │
│                         InsertOutboxMessagesInterceptor         │
└───────────────┬───────────────────────────────┬─────────────────┘
                │                               │
                ▼                               ▼
     PostgreSQL schemas                  Hangfire (postgres)
     jobs.jobs / job_photos              polls jobs.outbox_messages
     jobs.outbox_messages                       │
     billing.invoices                           ├── IGenerateInvoiceJob
                                                └── INotifyCustomerJob
```

## Cross-cutting

- **Multi-tenancy:** every query is scoped by `organization_id` (header today, JWT later).
- **Errors:** FluentValidation → 400; `Result` failures → 404/409; no exceptions for expected business outcomes.
- **Auth:** not implemented; demo organization id is documented in the README.

## Domain vs integration events vs outbox

Domain events (`JobCompletedDomainEvent`) stay inside Jobs. They capture something that already happened on the aggregate.

Integration events (`JobCompletedIntegrationEvent`) are the Open Host Service: a stable contract Billing and Notifications may consume without taking a project reference on Jobs.Domain.

The outbox stores those payloads in the **same transaction** as the aggregate write. If the process dies after commit, the row is still there (`processed_on_utc IS NULL`). Hangfire retries until success. That is **at-least-once** delivery, so invoice generation uses idempotency key `JobId + CompletedAt` (`ON CONFLICT DO NOTHING`).

## SOLID (from this codebase)

| Principle | Example |
| --- | --- |
| S | `CreateJobCommandHandler` only creates a job; search lives in `SearchJobsQueryHandler`. |
| O | `ValidationBehavior<TRequest,TResponse>` is an open MediatR pipeline; new validators register themselves. |
| L | `Result<TValue>` extends `Result` and can be treated as a success/failure without breaking callers. |
| I | `IJobRepository` is persist-only; `IJobReadRepository` is the read-side interface (no unused write methods). |
| D | Handlers depend on `IJobRepository` / `IUnitOfWork`; EF implementations are composed in Infrastructure. |

## GRASP

- **Information Expert:** `Job.Complete` owns the invariant “only InProgress jobs complete”.
- **Creator:** `Job.Create` / `JobPhoto.Create` (internal) create children inside the aggregate.
- **Controller:** `JobsEndpoints` translates HTTP into MediatR messages.
- **Low Coupling:** Billing depends on `JobTracker.Modules.Jobs.IntegrationEvents` only.
- **High Cohesion:** create/complete/search each live in their own use-case folder.

## GoF patterns used

| Pattern | Where | Problem solved |
| --- | --- | --- |
| Repository | `IJobRepository` + `JobRepository` | Persistence behind an interface for tests |
| Unit of Work | `IUnitOfWork` + `JobsDbContext.SaveChanges` | One transaction for aggregate + outbox |
| Mediator | MediatR | Decouple endpoints from handlers |
| Observer | Domain events + outbox dispatcher | React to completion without the aggregate knowing about billing |
| Factory | `Job.Create`, `JobPhoto.Create` | Enforce invariants at construction |
| Builder | Frontend `QueryBuilder<T>` | Type-safe, narrowing query construction |
| Strategy | FluentValidation validators | Per-command validation without a switch |
| Template Method | `ValueObject.GetEqualityComponents` | Structural equality algorithm in the base |
| State | `JobState` discriminated union + `transitionJob` overloads | Illegal transitions fail at compile time |

## Idempotency and eventual consistency

Completing a job is immediately consistent inside Jobs (row is `Completed` after `SaveChanges`). Invoice and email are **eventually** consistent: they happen after Hangfire reads the outbox. Replaying the same `JobCompletedIntegrationEvent` does not create a second invoice because `billing.invoices.idempotency_key` is unique.

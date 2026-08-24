# JobTracker

Multi-tenant roofing job management system. Office staff create, schedule, start, and complete jobs. Completing a job writes an outbox message in the same transaction; Hangfire then generates an invoice (Billing) and notifies the customer.

## Stack

- Frontend: Next.js 15 (App Router), TypeScript `strict`, Zustand, Feature Sliced Design
- Backend: .NET 10 modular monolith (Jobs, Billing, Notifications)
- Database: PostgreSQL 16, schema-per-module (`jobs`, `billing`)

## Quick start (Docker)

```bash
docker compose up --build
```

- Web UI: http://localhost:3000/jobs
- API: http://localhost:5020
- Hangfire dashboard: http://localhost:5020/hangfire
- OpenAPI: http://localhost:5020/openapi/v1.json

Demo tenant header used by the UI: `X-Organization-Id: 11111111-1111-1111-1111-111111111111`.

## Local development

PostgreSQL must be running (Docker Compose `postgres` service is enough).

```bash
# backend
cd backend
dotnet test JobTracker.slnx
dotnet run --project src/JobTracker.Api/JobTracker.Api.csproj

# frontend
cd frontend
npm install
npm test
npm run dev
```

Playwright (needs API + UI):

```bash
cd frontend
npx playwright install chromium
npm run e2e
```

## Architecture decisions

- **Modular monolith, not microservices.** One deployable, module boundaries via projects and PostgreSQL schemas. Jobs never references Billing; Billing consumes `JobCompletedIntegrationEvent` (Open Host Service).
- **CQRS inside the Jobs module.** Commands mutate the aggregate and return `Result<T>`. Search uses a read model with `AsNoTracking` projections.
- **Outbox + Hangfire instead of in-process publish.** `InsertOutboxMessagesInterceptor` writes outbox rows in the same `SaveChanges` as the job. A recurring Hangfire job polls unpublished rows and enqueues invoice/notification work. That is at-least-once: a crash after commit still retries; handlers are idempotent on `JobId + CompletedAt`.
- **Domain events vs integration events.** `JobCompletedDomainEvent` is a Jobs-module fact. `JobCompletedIntegrationEvent` is the public contract other modules may bind to. See `docs/architecture.md`.
- **Server Components for reads, Server Actions for mutations.** `/jobs` is a Server Component (`server-only`) that calls a use case from a DI container. Create/complete go through Server Actions.
- **Zustand holds UI state only.** The job list is hydrated from the server payload so optimistic status changes can roll back. It is not a second cache of the API.

## What I would improve with more time

- Real SendGrid client, Contacts module, and a Billing invoice UI
- Cursor pagination in the API (SQL already documents the keyset query)
- OpenTelemetry traces from Next.js fetch through Hangfire
- EF Core migrations checked in alongside the SQL bootstrap script
- Authentication and tenant resolution from JWT instead of a demo header

## Tests

| Layer | Command |
| --- | --- |
| Domain / application / architecture | `dotnet test backend/JobTracker.slnx` |
| TypeScript + Zustand | `npm test` in `frontend` |
| Playwright | `npm run e2e` in `frontend` |

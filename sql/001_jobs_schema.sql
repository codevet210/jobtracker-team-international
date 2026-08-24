-- Jobs module schema
-- Address is stored as owned columns on jobs (not a separate table) because it
-- has no independent identity and is always loaded with the aggregate.
-- Photos stay normalized: a job can have many photos, and they are never
-- queried as a standalone aggregate.

CREATE SCHEMA IF NOT EXISTS jobs;
CREATE SCHEMA IF NOT EXISTS billing;

CREATE TABLE IF NOT EXISTS jobs.jobs (
    id uuid PRIMARY KEY,
    title varchar(200) NOT NULL,
    description varchar(2000) NOT NULL,
    status varchar(32) NOT NULL,
    street varchar(200) NOT NULL,
    city varchar(100) NOT NULL,
    state varchar(100) NOT NULL,
    zip_code varchar(20) NOT NULL,
    latitude numeric(9, 6) NULL,
    longitude numeric(9, 6) NULL,
    scheduled_date timestamptz NULL,
    assignee_id uuid NULL,
    customer_id uuid NOT NULL,
    organization_id uuid NOT NULL,
    started_at timestamptz NULL,
    completed_at timestamptz NULL,
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS jobs.job_photos (
    id uuid PRIMARY KEY,
    job_id uuid NOT NULL REFERENCES jobs.jobs (id) ON DELETE CASCADE,
    url varchar(2048) NOT NULL,
    captured_at timestamptz NOT NULL,
    caption varchar(500) NULL
);

CREATE TABLE IF NOT EXISTS jobs.outbox_messages (
    id uuid PRIMARY KEY,
    type varchar(512) NOT NULL,
    content jsonb NOT NULL,
    occurred_on_utc timestamptz NOT NULL,
    processed_on_utc timestamptz NULL,
    error text NULL
);

CREATE TABLE IF NOT EXISTS billing.invoices (
    id uuid PRIMARY KEY,
    job_id uuid NOT NULL,
    customer_id uuid NOT NULL,
    organization_id uuid NOT NULL,
    completed_at timestamptz NOT NULL,
    idempotency_key text NOT NULL,
    created_at timestamptz NOT NULL,
    CONSTRAINT uq_invoices_idempotency UNIQUE (idempotency_key)
);

-- Multi-tenant lookups always include organization_id.
CREATE INDEX IF NOT EXISTS ix_jobs_organization_id
    ON jobs.jobs (organization_id);

-- Status-based filtering within a tenant.
CREATE INDEX IF NOT EXISTS ix_jobs_organization_id_status
    ON jobs.jobs (organization_id, status);

-- Date-range queries (schedule window) within a tenant.
CREATE INDEX IF NOT EXISTS ix_jobs_organization_id_scheduled_date
    ON jobs.jobs (organization_id, scheduled_date);

-- Cursor pagination support (created_at, id) is a stable unique order key.
CREATE INDEX IF NOT EXISTS ix_jobs_organization_id_created_at_id
    ON jobs.jobs (organization_id, created_at DESC, id);

-- Full-text search on title + description.
CREATE INDEX IF NOT EXISTS ix_jobs_title_description_fts
    ON jobs.jobs
    USING gin (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '')));

CREATE INDEX IF NOT EXISTS ix_job_photos_job_id
    ON jobs.job_photos (job_id);

CREATE INDEX IF NOT EXISTS ix_outbox_messages_unprocessed
    ON jobs.outbox_messages (occurred_on_utc)
    WHERE processed_on_utc IS NULL;

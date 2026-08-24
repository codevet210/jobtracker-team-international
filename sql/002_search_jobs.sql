-- Optimized tenant search:
-- - Full-text search on title + description
-- - Filter by multiple statuses
-- - Filter by scheduled date range
-- - Cursor-based pagination (not OFFSET)
-- - Photo count per job
--
-- Cursor pagination is preferred over OFFSET for large datasets because OFFSET
-- still walks and discards N rows on every page. A (created_at, id) keyset
-- seek uses the composite index and stays O(limit) rather than O(offset+limit).

-- :organization_id uuid
-- :search text        -- raw user input; wrap with plainto_tsquery in the app
-- :statuses text[]
-- :from timestamptz
-- :to timestamptz
-- :cursor_created_at timestamptz  -- null on the first page
-- :cursor_id uuid
-- :limit int

SELECT
    j.id,
    j.title,
    j.description,
    j.status,
    j.street,
    j.city,
    j.state,
    j.zip_code,
    j.scheduled_date,
    j.assignee_id,
    j.customer_id,
    j.organization_id,
    j.created_at,
    COALESCE(p.photo_count, 0) AS photo_count
FROM jobs.jobs AS j
LEFT JOIN LATERAL (
    SELECT COUNT(*)::int AS photo_count
    FROM jobs.job_photos AS jp
    WHERE jp.job_id = j.id
) AS p ON true
WHERE j.organization_id = :organization_id
  AND (
        :search IS NULL
        OR to_tsvector('english', coalesce(j.title, '') || ' ' || coalesce(j.description, ''))
            @@ plainto_tsquery('english', :search)
      )
  AND (
        :statuses IS NULL
        OR j.status = ANY(:statuses)
      )
  AND (
        :from IS NULL
        OR j.scheduled_date >= :from
      )
  AND (
        :to IS NULL
        OR j.scheduled_date <= :to
      )
  AND (
        :cursor_created_at IS NULL
        OR (j.created_at, j.id) < (:cursor_created_at, :cursor_id)
      )
ORDER BY j.created_at DESC, j.id DESC
LIMIT :limit;

-- Indexing strategy:
-- 1. (organization_id, status) covers the most common office-staff filter.
-- 2. (organization_id, scheduled_date) supports schedule-board date windows.
-- 3. (organization_id, created_at DESC, id) is the cursor pagination keyset.
-- 4. GIN(to_tsvector(...)) supports title/description search without ILIKE '%x%'.
-- 5. job_photos(job_id) keeps the LATERAL photo count from seq-scanning photos.

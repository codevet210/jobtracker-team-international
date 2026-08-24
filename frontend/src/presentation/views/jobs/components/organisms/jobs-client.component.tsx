"use client";

import { FilterBar, useFilterJobs } from "../../features/filter-jobs";
import { CompleteJobModal } from "../../features/complete-job";
import { CreateJobModal } from "../../features/create-job";
import { useJobsPage } from "../../hooks/use-jobs-page.hook";
import { JobsErrorBoundary } from "@/shared/ui/jobs-error-boundary";
import type { JobDto } from "@/shared/types/job";

type JobsClientProps = {
  initialJobs: JobDto[];
};

export function JobsClient({ initialJobs }: JobsClientProps) {
  const page = useJobsPage(initialJobs);

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Jobs</h1>
          <p className="text-sm text-slate-500">
            {page.totals.visible} shown · {page.totals.completed} completed ·{" "}
            {page.totals.total} total
          </p>
        </div>
        <button
          type="button"
          className="rounded bg-slate-900 px-4 py-2 text-white"
          data-testid="open-create-job"
          onClick={() => page.setCreateOpen(true)}
        >
          New job
        </button>
      </header>

      <JobFilters filters={page.filters} />

      <JobsErrorBoundary>
        <JobsTable
          jobs={page.jobs}
          onComplete={page.completeJob.open}
          onSchedule={page.completeJob.schedule}
          onStart={page.completeJob.start}
        />
      </JobsErrorBoundary>

      <CreateJobModal
        open={page.createOpen}
        state={page.createJob.state}
        dispatch={page.createJob.dispatch}
        onClose={() => page.setCreateOpen(false)}
        onSubmit={page.createJob.handleSubmit}
      />

      <CompleteJobModal
        job={page.completeJob.selectedJob}
        error={page.completeJob.error}
        onClose={page.completeJob.close}
        onConfirm={page.completeJob.complete}
      />
    </div>
  );
}

function JobFilters({
  filters,
}: {
  filters: ReturnType<typeof useFilterJobs>;
}) {
  return (
    <FilterBar>
      <FilterBar.Search value={filters.search} onChange={filters.setSearch} />
      <FilterBar.Status
        statuses={filters.statuses}
        availableStatuses={filters.availableStatuses}
        onToggle={filters.toggleStatus}
      />
      <FilterBar.DateRange
        from={filters.dateRange.from}
        to={filters.dateRange.to}
        onChange={filters.setDateRange}
      />
    </FilterBar>
  );
}

function JobsTable({
  jobs,
  onComplete,
  onSchedule,
  onStart,
}: {
  jobs: JobDto[];
  onComplete: (job: JobDto) => void;
  onSchedule: (job: JobDto) => void;
  onStart: (job: JobDto) => void;
}) {
  return jobs.length === 0 ? (
    <p className="rounded border p-6 text-slate-500" data-testid="jobs-empty">
      No jobs match the current filters.
    </p>
  ) : (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <table className="min-w-full text-left text-sm" data-testid="jobs-table">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">City</th>
            <th className="px-4 py-3">Photos</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id} className="border-t" data-testid={`job-row-${job.id}`}>
              <td className="px-4 py-3 font-medium" data-testid="job-title">
                {job.title}
              </td>
              <td className="px-4 py-3" data-testid="job-status">
                {job.status}
              </td>
              <td className="px-4 py-3">{job.city}</td>
              <td className="px-4 py-3">{job.photoCount}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  {job.status === "Draft" ? (
                    <button
                      type="button"
                      className="text-blue-700"
                      data-testid={`schedule-job-${job.title}`}
                      onClick={() => onSchedule(job)}
                    >
                      Schedule
                    </button>
                  ) : null}
                  {job.status === "Scheduled" ? (
                    <button
                      type="button"
                      className="text-blue-700"
                      data-testid={`start-job-${job.title}`}
                      onClick={() => onStart(job)}
                    >
                      Start
                    </button>
                  ) : null}
                  {job.status === "InProgress" ? (
                    <button
                      type="button"
                      className="text-emerald-700"
                      data-testid={`complete-job-${job.title}`}
                      onClick={() => onComplete(job)}
                    >
                      Complete
                    </button>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

"use client";

import { FilterBar, useFilterJobs } from "../../features/filter-jobs";
import { CompleteJobModal } from "../../features/complete-job";
import { CreateJobModal } from "../../features/create-job";
import { DemoCoach } from "../../features/run-demo";
import { useJobsPage } from "../../hooks/use-jobs-page.hook";
import { JobsErrorBoundary } from "@/shared/ui/jobs-error-boundary";
import { StatusBadge } from "@/shared/ui/status-badge";
import type { JobDto } from "@/shared/types/job";

type JobsClientProps = {
  initialJobs: JobDto[];
};

export function JobsClient({ initialJobs }: JobsClientProps) {
  const page = useJobsPage(initialJobs);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-wide text-orange-700 uppercase">
            Operations board
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">Roofing jobs</h1>
          <p className="mt-1 text-sm text-slate-600">
            {page.totals.visible} on this board · {page.totals.inProgress} in
            progress · {page.totals.completed} completed
          </p>
        </div>
        <button
          type="button"
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
          data-testid="open-create-job"
          onClick={() => page.setCreateOpen(true)}
        >
          New job
        </button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-4">
          <LifecycleStrip />
          <JobFilters filters={page.filters} />
          <JobsErrorBoundary>
            <JobsTable
              jobs={page.jobs}
              highlightedJobId={page.highlightedJobId}
              onComplete={page.completeJob.open}
              onSchedule={page.completeJob.schedule}
              onStart={page.completeJob.start}
            />
          </JobsErrorBoundary>
        </div>
        <DemoCoach
          phase={page.demo.phase}
          message={page.demo.message}
          isRunning={page.demo.isRunning}
          onRun={() => void page.demo.run()}
          onReset={page.demo.reset}
        />
      </div>

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

function LifecycleStrip() {
  const stages = ["Draft", "Scheduled", "In progress", "Completed"];
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
      {stages.map((stage, index) => (
        <span key={stage} className="flex items-center gap-2">
          <span className="font-medium text-slate-900">{stage}</span>
          {index < stages.length - 1 ? (
            <span aria-hidden className="text-slate-300">
              →
            </span>
          ) : null}
        </span>
      ))}
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
  highlightedJobId,
  onComplete,
  onSchedule,
  onStart,
}: {
  jobs: JobDto[];
  highlightedJobId: string | null;
  onComplete: (job: JobDto) => void;
  onSchedule: (job: JobDto) => void;
  onStart: (job: JobDto) => void;
}) {
  return jobs.length === 0 ? (
    <p
      className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500"
      data-testid="jobs-empty"
    >
      No jobs yet. Run the client demo or create a job to populate the board.
    </p>
  ) : (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm" data-testid="jobs-table">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3 font-medium">Job</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Site</th>
            <th className="px-4 py-3 font-medium">Photos</th>
            <th className="px-4 py-3 font-medium">Next action</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr
              key={job.id}
              className={
                job.id === highlightedJobId
                  ? "border-t bg-orange-50"
                  : "border-t"
              }
              data-testid={`job-row-${job.id}`}
            >
              <td className="px-4 py-3">
                <p className="font-medium text-slate-900" data-testid="job-title">
                  {job.title}
                </p>
                <p className="text-xs text-slate-500">{job.description}</p>
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={job.status} />
              </td>
              <td className="px-4 py-3 text-slate-600">
                {job.city}, {job.state}
              </td>
              <td className="px-4 py-3">{job.photoCount}</td>
              <td className="px-4 py-3">
                {job.status === "Draft" ? (
                  <button
                    type="button"
                    className="rounded-md bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-800"
                    data-testid={`schedule-job-${job.title}`}
                    onClick={() => onSchedule(job)}
                  >
                    Schedule crew
                  </button>
                ) : job.status === "Scheduled" ? (
                  <button
                    type="button"
                    className="rounded-md bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-800"
                    data-testid={`start-job-${job.title}`}
                    onClick={() => onStart(job)}
                  >
                    Start on site
                  </button>
                ) : job.status === "InProgress" ? (
                  <button
                    type="button"
                    className="rounded-md bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800"
                    data-testid={`complete-job-${job.title}`}
                    onClick={() => onComplete(job)}
                  >
                    Mark complete
                  </button>
                ) : (
                  <span className="text-xs text-slate-400">No action</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

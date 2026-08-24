"use client";

import type { ReactNode } from "react";
import type { JobStatus } from "@/shared/types/job";

type FilterBarProps = {
  children: ReactNode;
};

function FilterBarRoot({ children }: FilterBarProps) {
  return (
    <div
      className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-3"
      data-testid="job-filter-bar"
    >
      {children}
    </div>
  );
}

function Status({
  statuses,
  availableStatuses,
  onToggle,
}: {
  statuses: JobStatus[];
  availableStatuses: JobStatus[];
  onToggle: (status: JobStatus) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" data-testid="filter-status">
      {availableStatuses.map((status) => {
        const active = statuses.includes(status);
        return (
          <button
            key={status}
            type="button"
            data-testid={`filter-status-${status}`}
            className={
              active
                ? "rounded-full bg-slate-900 px-3 py-1 text-sm text-white"
                : "rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
            }
            onClick={() => onToggle(status)}
          >
            {status}
          </button>
        );
      })}
    </div>
  );
}

function Search({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      className="min-w-56 flex-1 rounded border px-3 py-2 text-sm"
      data-testid="filter-search"
      placeholder="Search title or description"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label="Search jobs"
    />
  );
}

function DateRange({
  from,
  to,
  onChange,
}: {
  from: string;
  to: string;
  onChange: (next: { from: string; to: string }) => void;
}) {
  return (
    <div className="flex gap-2" data-testid="filter-date-range">
      <input
        type="date"
        aria-label="From date"
        className="rounded border px-2 py-1 text-sm"
        value={from}
        onChange={(event) => onChange({ from: event.target.value, to })}
      />
      <input
        type="date"
        aria-label="To date"
        className="rounded border px-2 py-1 text-sm"
        value={to}
        onChange={(event) => onChange({ from, to: event.target.value })}
      />
    </div>
  );
}

export const FilterBar = Object.assign(FilterBarRoot, {
  Status,
  Search,
  DateRange,
});

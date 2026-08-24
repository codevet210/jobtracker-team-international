"use client";

import { useMemo, useState } from "react";
import { useJobFilters } from "../../../store/jobs.store";
import type { JobStatus } from "@/shared/types/job";

const STATUSES: JobStatus[] = [
  "Draft",
  "Scheduled",
  "InProgress",
  "Completed",
  "Cancelled",
];

export function useFilterJobs() {
  const { filters, setSearch, setStatuses } = useJobFilters();
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  function toggleStatus(status: JobStatus) {
    const next = filters.statuses.includes(status)
      ? filters.statuses.filter((item) => item !== status)
      : [...filters.statuses, status];
    setStatuses(next);
  }

  const activeFilterCount = useMemo(
    () =>
      filters.statuses.length +
      (filters.search.trim() ? 1 : 0) +
      (dateRange.from || dateRange.to ? 1 : 0),
    [filters.statuses.length, filters.search, dateRange],
  );

  return {
    search: filters.search,
    statuses: filters.statuses,
    availableStatuses: STATUSES,
    dateRange,
    activeFilterCount,
    setSearch,
    toggleStatus,
    setDateRange,
  };
}

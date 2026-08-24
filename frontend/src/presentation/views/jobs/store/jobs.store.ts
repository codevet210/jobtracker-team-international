"use client";

import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import type { JobDto, JobStatus } from "@/shared/types/job";

export type JobFilters = {
  statuses: JobStatus[];
  search: string;
};

export type SortConfig = {
  field: "title" | "status" | "createdAt";
  direction: "asc" | "desc";
};

export type Pagination = {
  page: number;
  pageSize: number;
};

type JobsUiState = {
  jobs: JobDto[];
  selectedJobIds: string[];
  filters: JobFilters;
  pagination: Pagination;
  sortConfig: SortConfig;
  hydrate: (jobs: JobDto[]) => void;
  setSearch: (search: string) => void;
  setStatuses: (statuses: JobStatus[]) => void;
  toggleSelected: (jobId: string) => void;
  setSort: (sortConfig: SortConfig) => void;
  setPage: (page: number) => void;
  optimisticStatus: (jobId: string, status: JobStatus) => JobStatus | null;
  rollbackStatus: (jobId: string, status: JobStatus) => void;
};

const selectFilteredJobs = (state: JobsUiState): JobDto[] => {
  const search = state.filters.search.trim().toLowerCase();

  const filtered = state.jobs.filter((job) => {
    const matchesStatus =
      state.filters.statuses.length === 0
        ? true
        : state.filters.statuses.includes(job.status);
    const matchesSearch =
      search.length === 0
        ? true
        : `${job.title} ${job.description}`.toLowerCase().includes(search);
    return matchesStatus && matchesSearch;
  });

  const sorted = [...filtered].sort((left, right) => {
    const field = state.sortConfig.field;
    const leftValue = left[field] ?? "";
    const rightValue = right[field] ?? "";
    const comparison = String(leftValue).localeCompare(String(rightValue));
    return state.sortConfig.direction === "asc" ? comparison : -comparison;
  });

  const start = (state.pagination.page - 1) * state.pagination.pageSize;
  return sorted.slice(start, start + state.pagination.pageSize);
};

export const useJobsStore = create<JobsUiState>((set) => ({
  jobs: [],
  selectedJobIds: [],
  filters: { statuses: [], search: "" },
  pagination: { page: 1, pageSize: 20 },
  sortConfig: { field: "createdAt", direction: "desc" },
  hydrate: (jobs) => set({ jobs }),
  setSearch: (search) =>
    set((state) => ({
      filters: { ...state.filters, search },
      pagination: { ...state.pagination, page: 1 },
    })),
  setStatuses: (statuses) =>
    set((state) => ({
      filters: { ...state.filters, statuses },
      pagination: { ...state.pagination, page: 1 },
    })),
  toggleSelected: (jobId) =>
    set((state) => ({
      selectedJobIds: state.selectedJobIds.includes(jobId)
        ? state.selectedJobIds.filter((id) => id !== jobId)
        : [...state.selectedJobIds, jobId],
    })),
  setSort: (sortConfig) => set({ sortConfig }),
  setPage: (page) =>
    set((state) => ({ pagination: { ...state.pagination, page } })),
  optimisticStatus: (jobId, status) => {
    let previous: JobStatus | null = null;
    set((state) => ({
      jobs: state.jobs.map((job) => {
        if (job.id !== jobId) {
          return job;
        }
        previous = job.status;
        return { ...job, status };
      }),
    }));
    return previous;
  },
  rollbackStatus: (jobId, status) =>
    set((state) => ({
      jobs: state.jobs.map((job) =>
        job.id === jobId ? { ...job, status } : job,
      ),
    })),
}));

const selectJobFilters = (state: JobsUiState) => ({
  filters: state.filters,
  setSearch: state.setSearch,
  setStatuses: state.setStatuses,
});

export const useFilteredJobs = () =>
  useJobsStore(useShallow(selectFilteredJobs));

export const useJobFilters = () =>
  useJobsStore(useShallow(selectJobFilters));

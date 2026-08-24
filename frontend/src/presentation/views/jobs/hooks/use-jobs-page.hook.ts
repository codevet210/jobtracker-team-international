"use client";

import { useEffect, useMemo, useState } from "react";
import { useCompleteJob } from "../features/complete-job";
import { useCreateJob } from "../features/create-job";
import { useFilterJobs } from "../features/filter-jobs";
import { useFilteredJobs, useJobsStore } from "../store/jobs.store";
import type { JobDto } from "@/shared/types/job";

export function useJobsPage(initialJobs: JobDto[]) {
  const hydrate = useJobsStore((state) => state.hydrate);
  const jobs = useJobsStore((state) => state.jobs);
  const filteredJobs = useFilteredJobs();
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    hydrate(initialJobs);
    // Hydrate once from the server payload. Re-running on each new array
    // identity would loop with the filtered-jobs selector.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrate]);

  const createJob = useCreateJob(() => {
    window.location.reload();
  });

  const completeJob = useCompleteJob(() => {
    window.location.reload();
  });

  const filters = useFilterJobs();

  const totals = useMemo(
    () => ({
      total: jobs.length,
      completed: jobs.filter((job) => job.status === "Completed").length,
      visible: filteredJobs.length,
    }),
    [jobs, filteredJobs],
  );

  return {
    jobs: filteredJobs,
    totals,
    createOpen,
    setCreateOpen,
    createJob,
    completeJob,
    filters,
  };
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { searchJobsAction } from "@/application/jobs/search-jobs.action";
import { useCompleteJob } from "../features/complete-job";
import { useCreateJob } from "../features/create-job";
import { useFilterJobs } from "../features/filter-jobs";
import { useRunDemo } from "../features/run-demo";
import { useFilteredJobs, useJobsStore } from "../store/jobs.store";
import type { JobDto } from "@/shared/types/job";

export function useJobsPage(initialJobs: JobDto[]) {
  const hydrate = useJobsStore((state) => state.hydrate);
  const jobs = useJobsStore((state) => state.jobs);
  const filteredJobs = useFilteredJobs();
  const highlightedJobId = useJobsStore((state) => state.highlightedJobId);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    hydrate(initialJobs);
    // Hydrate once from the server payload. Re-running on each new array
    // identity would loop with the filtered-jobs selector.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrate]);

  async function refresh() {
    const page = await searchJobsAction();
    hydrate(page.items);
  }

  const createJob = useCreateJob(() => {
    void refresh();
  });

  const completeJob = useCompleteJob(() => {
    void refresh();
  });

  const demo = useRunDemo(refresh);

  const filters = useFilterJobs();

  const totals = useMemo(
    () => ({
      total: jobs.length,
      completed: jobs.filter((job) => job.status === "Completed").length,
      inProgress: jobs.filter((job) => job.status === "InProgress").length,
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
    demo,
    highlightedJobId,
  };
}

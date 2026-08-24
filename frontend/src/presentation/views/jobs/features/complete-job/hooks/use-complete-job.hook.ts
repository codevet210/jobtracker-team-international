"use client";

import { useState } from "react";
import {
  completeJobAction,
  scheduleJobAction,
  startJobAction,
} from "@/application/jobs/job.actions";
import { useJobsStore } from "../../../store/jobs.store";
import type { JobDto } from "@/shared/types/job";

export function useCompleteJob(onCompleted: () => void) {
  const [selectedJob, setSelectedJob] = useState<JobDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const optimisticStatus = useJobsStore((state) => state.optimisticStatus);
  const rollbackStatus = useJobsStore((state) => state.rollbackStatus);

  async function complete(job: JobDto) {
    setError(null);
    const previous = optimisticStatus(job.id, "Completed");
    try {
      await completeJobAction(job.id);
      setSelectedJob(null);
      onCompleted();
    } catch (caught) {
      if (previous) {
        rollbackStatus(job.id, previous);
      }
      setError(caught instanceof Error ? caught.message : "Complete failed.");
    }
  }

  async function schedule(job: JobDto) {
    const previous = optimisticStatus(job.id, "Scheduled");
    try {
      await scheduleJobAction(job.id);
      onCompleted();
    } catch {
      if (previous) {
        rollbackStatus(job.id, previous);
      }
    }
  }

  async function start(job: JobDto) {
    const previous = optimisticStatus(job.id, "InProgress");
    try {
      await startJobAction(job.id);
      onCompleted();
    } catch {
      if (previous) {
        rollbackStatus(job.id, previous);
      }
    }
  }

  return {
    selectedJob,
    error,
    open: (job: JobDto) => setSelectedJob(job),
    close: () => setSelectedJob(null),
    complete,
    schedule,
    start,
  };
}

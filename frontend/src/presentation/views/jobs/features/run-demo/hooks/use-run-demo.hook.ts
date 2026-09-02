"use client";

import { useState } from "react";
import {
  completeJobAction,
  createJobAction,
  scheduleJobAction,
  startJobAction,
} from "@/application/jobs/job.actions";
import { useJobsStore } from "../../../store/jobs.store";
import { SAMPLE_ROOFING_JOB } from "../data/sample-job";

export type DemoPhase =
  | "idle"
  | "create"
  | "schedule"
  | "start"
  | "complete"
  | "done"
  | "error";

const pause = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export function useRunDemo(onRefresh: () => Promise<void>) {
  const [phase, setPhase] = useState<DemoPhase>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const setHighlightedJobId = useJobsStore(
    (state) => state.setHighlightedJobId,
  );

  async function run() {
    setMessage(null);
    try {
      setPhase("create");
      const created = await createJobAction(SAMPLE_ROOFING_JOB);
      setHighlightedJobId(created.id);
      await onRefresh();
      await pause(700);

      setPhase("schedule");
      await scheduleJobAction(created.id);
      await onRefresh();
      await pause(700);

      setPhase("start");
      await startJobAction(created.id);
      await onRefresh();
      await pause(700);

      setPhase("complete");
      await completeJobAction(created.id);
      await onRefresh();

      setPhase("done");
      setMessage(
        "Job completed. Hangfire will pick up the outbox row and generate an invoice plus a customer notification.",
      );
    } catch (error) {
      setPhase("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Demo stopped. Confirm the API and Postgres are running.",
      );
      await onRefresh().catch(() => undefined);
    }
  }

  function reset() {
    setPhase("idle");
    setMessage(null);
    setHighlightedJobId(null);
  }

  return { phase, message, run, reset, isRunning: isBusy(phase) };
}

function isBusy(phase: DemoPhase) {
  return (
    phase === "create" ||
    phase === "schedule" ||
    phase === "start" ||
    phase === "complete"
  );
}

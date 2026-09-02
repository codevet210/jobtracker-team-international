"use client";

import { DEMO_STEPS } from "../../data/sample-job";
import type { DemoPhase } from "../../hooks/use-run-demo.hook";

type DemoCoachProps = {
  phase: DemoPhase;
  message: string | null;
  isRunning: boolean;
  onRun: () => void;
  onReset: () => void;
};

export function DemoCoach({
  phase,
  message,
  isRunning,
  onRun,
  onReset,
}: DemoCoachProps) {
  return (
    <aside
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      data-testid="demo-coach"
    >
      <p className="text-xs font-semibold tracking-wide text-orange-700 uppercase">
        Client demo
      </p>
      <h2 className="mt-1 text-lg font-semibold text-slate-900">
        One roofing job, office to invoice
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        Press play and watch a job move Draft → Scheduled → In progress →
        Completed. Completing it is what triggers billing and the customer
        notice.
      </p>

      <ol className="mt-4 space-y-3">
        {DEMO_STEPS.map((step, index) => {
          const state = stepState(phase, step.id);
          return (
            <li key={step.id} className="flex gap-3">
              <span
                className={
                  state === "active"
                    ? "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-600 text-xs font-bold text-white"
                    : state === "done"
                      ? "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white"
                      : "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600"
                }
              >
                {index + 1}
              </span>
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {step.label}
                  <span className="ml-2 text-xs font-normal text-slate-500">
                    {step.status}
                  </span>
                </p>
                <p className="text-xs text-slate-500">{step.talk}</p>
              </div>
            </li>
          );
        })}
      </ol>

      {message ? (
        <p
          className={
            phase === "error"
              ? "mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800"
              : "mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800"
          }
          data-testid="demo-message"
        >
          {message}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          data-testid="run-client-demo"
          onClick={onRun}
          disabled={isRunning}
        >
          {isRunning ? talkingLabel(phase) : "Run 30-second demo"}
        </button>
        <button
          type="button"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700"
          onClick={onReset}
          disabled={isRunning}
        >
          Reset guide
        </button>
      </div>
    </aside>
  );
}

function talkingLabel(phase: DemoPhase) {
  switch (phase) {
    case "create":
      return "Creating job…";
    case "schedule":
      return "Scheduling crew…";
    case "start":
      return "Starting on site…";
    case "complete":
      return "Completing + invoicing…";
    default:
      return "Running…";
  }
}

function stepState(
  phase: DemoPhase,
  stepId: (typeof DEMO_STEPS)[number]["id"],
): "idle" | "active" | "done" {
  const order = ["create", "schedule", "start", "complete"] as const;
  if (phase === "idle") {
    return "idle";
  }
  if (phase === "done") {
    return "done";
  }
  if (phase === "error") {
    return "idle";
  }
  const current = order.indexOf(phase);
  const target = order.indexOf(stepId);
  if (target < current) {
    return "done";
  }
  if (target === current) {
    return "active";
  }
  return "idle";
}

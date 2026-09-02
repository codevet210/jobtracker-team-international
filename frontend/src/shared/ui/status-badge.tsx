import type { JobStatus } from "@/shared/types/job";

const STYLES: Record<JobStatus, string> = {
  Draft: "bg-slate-100 text-slate-700",
  Scheduled: "bg-sky-100 text-sky-800",
  InProgress: "bg-amber-100 text-amber-800",
  Completed: "bg-emerald-100 text-emerald-800",
  Cancelled: "bg-rose-100 text-rose-800",
};

export function StatusBadge({ status }: { status: JobStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STYLES[status]}`}
      data-testid="job-status"
    >
      {status === "InProgress" ? "In progress" : status}
    </span>
  );
}

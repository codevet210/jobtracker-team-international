"use client";

import type { JobDto } from "@/shared/types/job";

type CompleteJobModalProps = {
  job: JobDto | null;
  error: string | null;
  onClose: () => void;
  onConfirm: (job: JobDto) => void;
};

export function CompleteJobModal({
  job,
  error,
  onClose,
  onConfirm,
}: CompleteJobModalProps) {
  return job ? (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4"
      data-testid="complete-job-modal"
      role="dialog"
      aria-labelledby="complete-job-title"
    >
      <div className="w-full max-w-md rounded-lg bg-white p-6 text-slate-900 shadow-xl">
        <h2 id="complete-job-title" className="text-lg font-semibold">
          Complete job
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Mark <strong>{job.title}</strong> as completed? This raises a domain
          event that generates an invoice and notifies the customer.
        </p>
        {error ? (
          <p className="mt-3 text-sm text-red-600" data-testid="complete-job-error">
            {error}
          </p>
        ) : null}
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className="rounded border px-3 py-2" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="rounded bg-emerald-700 px-3 py-2 text-white"
            data-testid="complete-job-confirm"
            onClick={() => onConfirm(job)}
          >
            Complete job
          </button>
        </div>
      </div>
    </div>
  ) : null;
}

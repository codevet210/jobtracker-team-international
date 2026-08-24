"use client";

import type { CreateJobDispatch, CreateJobState } from "../../hooks/use-create-job.hook";

type CreateJobModalProps = {
  open: boolean;
  state: CreateJobState;
  dispatch: CreateJobDispatch;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export function CreateJobModal({
  open,
  state,
  dispatch,
  onClose,
  onSubmit,
}: CreateJobModalProps) {
  return open ? (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4"
      data-testid="create-job-modal"
      role="dialog"
      aria-labelledby="create-job-title"
    >
      <form
        className="w-full max-w-lg rounded-lg bg-white p-6 text-slate-900 shadow-xl"
        onSubmit={onSubmit}
      >
        <h2 id="create-job-title" className="text-lg font-semibold">
          Create job
        </h2>
        <div className="mt-4 grid gap-3">
          <LabeledInput
            label="Title"
            testId="create-job-title-input"
            value={state.title}
            onChange={(value) =>
              dispatch({ type: "setField", field: "title", value })
            }
          />
          <LabeledInput
            label="Description"
            testId="create-job-description-input"
            value={state.description}
            onChange={(value) =>
              dispatch({ type: "setField", field: "description", value })
            }
          />
          <LabeledInput
            label="Street"
            testId="create-job-street-input"
            value={state.street}
            onChange={(value) =>
              dispatch({ type: "setField", field: "street", value })
            }
          />
          <LabeledInput
            label="City"
            testId="create-job-city-input"
            value={state.city}
            onChange={(value) =>
              dispatch({ type: "setField", field: "city", value })
            }
          />
          <LabeledInput
            label="State"
            testId="create-job-state-input"
            value={state.state}
            onChange={(value) =>
              dispatch({ type: "setField", field: "state", value })
            }
          />
          <LabeledInput
            label="ZIP"
            testId="create-job-zip-input"
            value={state.zipCode}
            onChange={(value) =>
              dispatch({ type: "setField", field: "zipCode", value })
            }
          />
        </div>
        {state.error ? (
          <p className="mt-3 text-sm text-red-600" data-testid="create-job-error">
            {state.error}
          </p>
        ) : null}
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            className="rounded border px-3 py-2"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded bg-slate-900 px-3 py-2 text-white"
            data-testid="create-job-submit"
            disabled={state.isSubmitting}
          >
            {state.isSubmitting ? "Saving..." : "Create job"}
          </button>
        </div>
      </form>
    </div>
  ) : null;
}

function LabeledInput({
  label,
  value,
  onChange,
  testId,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  testId: string;
}) {
  return (
    <label className="grid gap-1 text-sm">
      {label}
      <input
        className="rounded border px-3 py-2"
        data-testid={testId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

"use client";

export default function JobsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-xl space-y-4 p-6">
      <h1 className="text-xl font-semibold">Could not load jobs</h1>
      <p className="text-slate-600">{error.message}</p>
      <button
        type="button"
        className="rounded bg-slate-900 px-4 py-2 text-white"
        onClick={reset}
      >
        Try again
      </button>
    </main>
  );
}

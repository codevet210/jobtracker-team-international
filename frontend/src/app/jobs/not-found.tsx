import Link from "next/link";

export default function JobsNotFound() {
  return (
    <main className="mx-auto max-w-xl space-y-4 p-6">
      <h1 className="text-xl font-semibold">Job not found</h1>
      <p className="text-slate-600">
        That job does not exist or is outside your organization.
      </p>
      <Link className="text-blue-700 underline" href="/jobs">
        Back to jobs
      </Link>
    </main>
  );
}

import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-sm font-semibold tracking-wide text-orange-700 uppercase">
        JobTracker · roofing operations
      </p>
      <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-slate-900">
        From the office request to a completed roof — and the invoice that
        follows.
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-slate-600">
        Office staff create and assign jobs. When a crew marks the work
        complete, billing and the customer notification happen automatically in
        the background.
      </p>

      <ol className="mt-10 grid gap-4 sm:grid-cols-4">
        {[
          ["1. Create", "Capture the leak, address, and customer."],
          ["2. Schedule", "Assign a crew to a future date."],
          ["3. Work", "Start the job only after it is scheduled."],
          ["4. Complete", "Invoice + notify via the outbox."],
        ].map(([title, copy]) => (
          <li
            key={title}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="font-semibold text-slate-900">{title}</p>
            <p className="mt-1 text-sm text-slate-600">{copy}</p>
          </li>
        ))}
      </ol>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/jobs"
          className="rounded-lg bg-orange-600 px-5 py-3 text-sm font-semibold text-white"
        >
          Open the operations board
        </Link>
        <p className="self-center text-sm text-slate-500">
          Then press “Run 30-second demo”.
        </p>
      </div>
    </main>
  );
}

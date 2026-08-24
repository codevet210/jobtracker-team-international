import "server-only";

import { Suspense } from "react";
import { container } from "@/application/container";
import { JobsClient } from "@/presentation/views/jobs";
import { JobsListSkeleton } from "@/shared/ui/jobs-list-skeleton";

export const dynamic = "force-dynamic";

async function JobsList() {
  const page = await container.searchJobs();
  return <JobsClient initialJobs={page.items} />;
}

export default function JobsPage() {
  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <Suspense fallback={<JobsListSkeleton />}>
        <JobsList />
      </Suspense>
    </main>
  );
}

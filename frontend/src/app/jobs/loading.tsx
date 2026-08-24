import { JobsListSkeleton } from "@/shared/ui/jobs-list-skeleton";

export default function JobsLoading() {
  return (
    <main className="mx-auto max-w-6xl p-6">
      <JobsListSkeleton />
    </main>
  );
}

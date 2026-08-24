export function JobsListSkeleton() {
  return (
    <div className="animate-pulse space-y-3" data-testid="jobs-skeleton">
      <div className="h-10 rounded bg-slate-200" />
      <div className="h-24 rounded bg-slate-200" />
      <div className="h-24 rounded bg-slate-200" />
    </div>
  );
}

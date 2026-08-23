import { cn } from "@/lib/utils";

export function Skeleton({ className }) {
  return <div className={cn("animate-pulse rounded-md bg-slate-200/70", className)} />;
}

export function JobRowSkeleton() {
  return (
    <div className="space-y-2 px-4 py-3.5 sm:px-5">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-3 w-48" />
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 sm:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white p-4">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-2 h-6 w-12" />
        </div>
      ))}
    </div>
  );
}
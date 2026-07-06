import { Skeleton } from "../ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="p-6 space-y-6 bg-[#f4f6ff] min-h-screen">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-36 bg-slate-200" />
        <Skeleton className="h-8 w-8 rounded-full bg-slate-200" />
      </div>
      <Skeleton className="h-40 rounded-3xl bg-slate-200" />
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 rounded-2xl bg-slate-200" />
        ))}
      </div>
      <Skeleton className="h-20 rounded-2xl bg-slate-200" />
    </div>
  );
}
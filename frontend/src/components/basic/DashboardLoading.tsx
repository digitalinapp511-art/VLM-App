import { Skeleton } from "../ui/skeleton";
export default function DashboardLoading() {
  return (
    <div className="p-6 space-y-6 bg-black min-h-screen">
      <Skeleton className="h-8 w-48 bg-white/5" />
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 rounded-3xl bg-white/5" />)}
      </div>
      <Skeleton className="h-48 rounded-[2.5rem] bg-white/5" />
    </div>
  );
}
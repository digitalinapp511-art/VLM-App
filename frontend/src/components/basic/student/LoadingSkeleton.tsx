import { Skeleton } from "@/components/ui/skeleton";
export default function LoadingSkeleton() {
  return (
    <div className="p-6 space-y-8 bg-[#f4f6ff] dark:bg-[#0b081e] min-h-screen transition-colors duration-300">
      <div className="flex justify-between items-center">
        <Skeleton className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-800" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
          <Skeleton className="h-10 w-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
      <Skeleton className="h-10 w-48 bg-slate-200 dark:bg-slate-800" />
      <Skeleton className="h-56 rounded-[2.5rem] bg-slate-200 dark:bg-slate-800" />
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-24 rounded-3xl bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
    </div>
  );
}
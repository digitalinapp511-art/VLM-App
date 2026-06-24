import { Skeleton } from "@/components/ui/skeleton";
export default function LoadingSkeleton() {
  return (
    <div className="p-6 space-y-8 bg-black min-h-screen">
      <div className="flex justify-between items-center"><Skeleton className="h-12 w-12 rounded-full bg-white/5" /><div className="flex gap-2"><Skeleton className="h-10 w-10 bg-white/5" /><Skeleton className="h-10 w-10 bg-white/5" /></div></div>
      <Skeleton className="h-10 w-48 bg-white/5" />
      <Skeleton className="h-56 rounded-[2.5rem] bg-white/5" />
      <div className="space-y-4">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-3xl bg-white/5" />)}
      </div>
    </div>
  );
}
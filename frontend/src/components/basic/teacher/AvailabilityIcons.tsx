import { cn } from "@/lib/utils";
export const OnlineWaveIcon = () => (
  <div className="flex items-center justify-center gap-1.5 h-12">
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className={cn(
          "w-1 bg-current rounded-full transition-all duration-500",
          i === 2 ? "h-10" : i === 1 || i === 3 ? "h-7" : "h-4"
        )}
      />
    ))}
  </div>
);

export const BusyIcon = () => (
  <div className="w-12 h-12 rounded-xl bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center shadow-inner">
     <div className="flex gap-1.5">
        <div className="w-1.5 h-5 bg-white rounded-full" />
        <div className="w-1.5 h-5 bg-white rounded-full" />
     </div>
  </div>
);
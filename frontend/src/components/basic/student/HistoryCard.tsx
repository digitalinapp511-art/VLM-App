import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Calendar, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function HistoryCard({ item }: any) {
  const isReward = item.status === "Reward Credited";
  const isApproved = item.status === "Approved";
  const isPending = item.status === "Pending";

  return (
    <Card className="border border-slate-100 dark:border-[#221c4e] bg-white dark:bg-[#161233] text-slate-800 dark:text-slate-100 rounded-[1.8rem] overflow-hidden transition-all duration-300 shadow-sm hover:border-violet-500/20">
      <CardContent className="px-6 py-4 space-y-3.5">
        
        {/* Header: Topic & Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-xs font-black">
             <Calendar size={14} className="text-slate-400 dark:text-slate-500" /> {item.subject}
          </div>
          <Badge variant="outline" className={cn(
            "rounded-full px-2.5 py-0.5 text-[8px] font-black tracking-widest border uppercase",
            isReward && "border-cyan-500/30 text-cyan-500 bg-cyan-500/5",
            isApproved && "border-green-500/30 text-green-500 bg-green-500/5",
            isPending && "border-amber-500/30 text-amber-500 bg-amber-500/5"
          )}>
            {item.status}
          </Badge>
        </div>

        {/* User Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-slate-200 dark:border-slate-800">
              <AvatarImage src={item.avatar} />
              <AvatarFallback><User size={14} /></AvatarFallback>
            </Avatar>
            <h3 className="text-xs font-black text-slate-800 dark:text-white tracking-tight">{item.name}</h3>
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
             Joined: <span className="text-slate-600 dark:text-slate-350">{item.date}</span>
          </div>
        </div>

        {/* Footer Info */}
        <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
           Student / {item.subject}
        </p>

      </CardContent>
    </Card>
  );
}
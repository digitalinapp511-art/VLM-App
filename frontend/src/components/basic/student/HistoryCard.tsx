import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {Calendar, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
export default function HistoryCard({ item }: any) {
  const isReward = item.status === "Reward Credited";
  const isApproved = item.status === "Approved";
  const isPending = item.status === "Pending";

  return (
    <Card className="bg-white/5 border-white/5 backdrop-blur-xl rounded-lg overflow-hidden transition-all hover:bg-white/[0.08]">
      <CardContent className="px-6 space-y-4">
        
        {/* Header: Topic & Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white   text-sm">
             <Calendar size={16} className="text-white/40" /> {item.subject}
          </div>
          <Badge variant="outline" className={cn(
            "rounded-full px-3 py-0.5 text-[9px] font-black tracking-widest border uppercase",
            isReward && "border-cyan-500 text-cyan-400 bg-cyan-500/5 shadow-[0_0_10px_rgba(34,211,238,0.2)]",
            isApproved && "border-green-500 text-green-500 bg-green-500/5",
            isPending && "border-yellow-500 text-yellow-500 bg-yellow-500/5"
          )}>
            {item.status}
          </Badge>
        </div>

        {/* User Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-white/10">
              <AvatarImage src={item.avatar} />
              <AvatarFallback><User /></AvatarFallback>
            </Avatar>
            <h3 className="   text-white tracking-tight">{item.name}</h3>
          </div>
          <div className="text-[10px] text-white/40 font-medium">
             Joined: <span className="text-white/60">{item.date}</span>
          </div>
        </div>

        {/* Footer Info */}
        <p className="text-[10px] text-white/20 italic font-medium italic">
           Student / {item.subject}
        </p>

      </CardContent>
    </Card>
  );
}
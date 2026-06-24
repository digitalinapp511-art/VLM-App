import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ActiveLinkCardProps {
  title: string;
  date: string;
  id: string;
  link: string;
}

const ActiveLinkCard: React.FC<ActiveLinkCardProps> = ({ title, date, id, link }) => {
  return (
    <div className="p-6 rounded-[32px] border border-white/5 bg-white/[0.02] backdrop-blur-md space-y-5">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h4 className="text-[15px] font-bold text-zinc-100">{title}</h4>
          <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
            {date} • {id}
          </p>
        </div>
        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px] font-black uppercase rounded-lg">
          Active
        </Badge>
      </div>

      <p className="text-xl font-medium text-zinc-400 tracking-tight">
        {link}
      </p>

      <div className="flex gap-3">
        <Button variant="outline" size="sm" className="flex-1 rounded-xl bg-zinc-900/50 border-white/10 text-zinc-400 text-[11px] font-bold uppercase">
          Copy Link
        </Button>
        <Button variant="outline" size="sm" className="flex-1 rounded-xl bg-zinc-900/50 border-white/10 text-zinc-400 text-[11px] font-bold uppercase">
          Share
        </Button>
        <Button variant="outline" size="sm" className="flex-1 rounded-xl bg-zinc-900/50 border-white/10 text-zinc-400 text-[11px] font-bold uppercase">
          Track
        </Button>
      </div>
    </div>
  );
};

export default ActiveLinkCard;
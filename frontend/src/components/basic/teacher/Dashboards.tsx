import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Share2 } from "lucide-react";

// 1. Upcoming Live Class Item
export const LiveClassItem: React.FC<{ title: string; time: string }> = ({ title, time }) => (
  <div className="flex items-center justify-between p-5 rounded-3xl border border-white/5 bg-zinc-900/30 hover:bg-zinc-800/40 transition-all">
    <div className="space-y-1">
      <h4 className="text-base font-black text-white tracking-tight">{title}</h4>
      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{time}</p>
    </div>
    <Button variant="outline" className="rounded-full border-cyan-500/50 text-cyan-400 hover:bg-cyan-400/10 px-6 font-bold h-9">
      Join
    </Button>
  </div>
);

// 2. Recent Review Card
export const ReviewCard: React.FC = () => (
  <div className="p-5 rounded-3xl border border-white/5 bg-zinc-900/40 space-y-4">
    <div className="flex items-center gap-3">
      <Avatar className="w-10 h-10 border border-white/10">
        <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" />
        <AvatarFallback>SN</AvatarFallback>
      </Avatar>
      <div className="space-y-0.5">
        <h4 className="text-sm font-bold text-white leading-none">Student Name</h4>
        <div className="flex gap-0.5 text-purple-400">
          {[...Array(5)].map((_, i) => <Star key={i} size={10} fill="currentColor" />)}
        </div>
      </div>
    </div>
    <p className="text-xs text-zinc-400 font-medium leading-relaxed italic">
      "I have execution and evaluated calculus."
    </p>
  </div>
);

// 3. Referral Card
export const ReferralCard: React.FC = () => (
  <div className="p-5 rounded-3xl border border-white/5 bg-zinc-900/40 flex items-center justify-between">
    <div className="space-y-1">
      <p className="text-xs text-zinc-300 font-bold tracking-tight">referral code: <span className="text-white uppercase">XXX</span></p>
      <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Bonus info: 20% core</p>
    </div>
    <button className="p-2.5 rounded-full bg-zinc-800 text-cyan-400 hover:text-white transition-colors shadow-inner">
      <Share2 size={18} />
    </button>
  </div>
);
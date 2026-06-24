import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
export const PointsCard = ({ points, inr }: { points: string; inr: string }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex-1 p-6 rounded-[32px] border border-cyan-500/40 bg-zinc-950/40 backdrop-blur-xl flex flex-col justify-between min-h-[280px] shadow-[0_0_40px_rgba(34,211,238,0.1)]"
  >
    <div className="space-y-4">
      <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Total VLM Points</p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-cyan-400/10 flex items-center justify-center border border-cyan-400/30">
          <Star className="text-cyan-400 fill-cyan-400" size={20} />
        </div>
        <div className="flex flex-col">
          <span className="text-3xl font-black text-white tracking-tighter leading-none">{points}</span>
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Points</span>
        </div>
      </div>
    </div>

    <div className="space-y-1 pt-6 border-t border-white/5">
      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">INR Equivalent</p>
      <h3 className="text-2xl font-black text-cyan-400 tracking-tighter">₹ {inr}</h3>
    </div>
  </motion.div>
);

export const BalanceCard = ({ title, value, icon: Icon, variant = "purple" }: { title: string, value: string, icon: any, variant?: "purple" | "zinc" }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    className={cn(
      "p-5 rounded-[24px] border flex flex-col gap-4 bg-zinc-950/40 backdrop-blur-md",
      variant === "purple" ? "border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.1)]" : "border-white/10"
    )}
  >
    <div className="flex flex-col gap-1">
      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-tight">{title}</p>
      <div className="flex items-center gap-3 mt-1">
        <div className={cn("w-9 h-9 rounded-full flex items-center justify-center border", variant === "purple" ? "bg-purple-500/10 border-purple-500/30 text-purple-400" : "bg-zinc-800 border-zinc-700 text-zinc-400")}>
          <Icon size={18} />
        </div>
        <span className="text-xl font-black text-white tracking-tighter">₹ {value}</span>
      </div>
    </div>
  </motion.div>
);
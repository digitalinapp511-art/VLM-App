import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
export const PointsCard = ({ points, inr }: { points: string; inr: string }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="p-5 rounded-[24px] border border-cyan-500/40 bg-zinc-950/40 backdrop-blur-xl flex flex-col gap-3 shadow-[0_0_30px_rgba(34,211,238,0.08)]"
  >
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total VLM Points</p>
        <div className="flex items-center gap-2 mt-1">
          <Star className="text-cyan-400 fill-cyan-400" size={16} />
          <span className="text-2xl font-black text-white tracking-tighter leading-none">{points}</span>
        </div>
      </div>
      <div className="text-right space-y-1">
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">INR Equivalent</p>
        <h3 className="text-lg font-black text-cyan-400 tracking-tighter mt-1">₹ {inr}</h3>
      </div>
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
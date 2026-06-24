import { ChevronRight } from "lucide-react";

export const AmountCard = ({ amount, points }: { amount: string; points: string }) => (
  <div className="p-6 rounded-[32px] border-2 border-cyan-400 bg-zinc-950/40 backdrop-blur-xl shadow-[0_0_20px_rgba(34,211,238,0.1)]">
    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em] mb-3">Requested Amount</p>
    <div className="flex items-baseline gap-2">
      <span className="text-xl font-bold text-cyan-400">₹</span>
      <h2 className="text-4xl font-black text-white tracking-tighter">{amount}</h2>
      <span className="text-xl font-bold text-cyan-400 ml-1">INR</span>
    </div>
    <p className="text-sm font-medium text-zinc-500 mt-2">~ {points} VLM Points</p>
  </div>
);

export const PayoutCard = () => (
  <div className="p-6 rounded-[32px] border border-white/5 bg-white/[0.02] backdrop-blur-md">
    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em] mb-4">Payout Method</p>
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-[#ed1c24] rounded-xl flex items-center justify-center shadow-lg">
        <span className="text-2xl font-black text-white">H</span>
      </div>
      <div className="flex-1 space-y-0.5">
        <h4 className="text-lg font-black text-white leading-tight">HDFC Bank</h4>
        <p className="text-[11px] font-bold text-zinc-500 uppercase">Account No.: **** 3633</p>
      </div>
      <div className="flex items-center gap-1 text-cyan-400">
        <ChevronRight size={16} />
        <ChevronRight size={16} className="-ml-2" />
        <span className="text-[11px] font-black uppercase tracking-widest ml-1">IMPS</span>
      </div>
    </div>
  </div>
);
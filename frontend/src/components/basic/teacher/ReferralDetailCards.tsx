import { Badge } from "@/components/ui/badge";

export const ReferredUserCard = () => (
  <div className="p-6 rounded-[32px] border-l-4 border-cyan-400 border bg-zinc-900/40 backdrop-blur-xl space-y-5">
    <div className="flex justify-between items-start">
      <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Referred<br/>User</p>
      <Badge className="bg-purple-600/20 text-purple-400 border border-purple-600/30 font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-lg">
        Teacher
      </Badge>
    </div>

    <div className="flex items-center gap-4">
      <div className="w-14 h-14 rounded-full bg-zinc-800 border border-white/5" />
      <div className="space-y-0.5">
        <h4 className="text-lg font-bold text-zinc-100">Mr. Aris Johnson<span className="text-zinc-600 font-medium text-xs ml-2">(optional)</span></h4>
        <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Oct 28, 2024 • 11:30 AM</p>
        <p className="text-[11px] font-medium text-zinc-600 leading-tight">Joined via your<br/>link</p>
      </div>
    </div>
  </div>
);

export const WalletPointsCard = () => (
  <div className="p-6 rounded-[32px] border-l-4 border-yellow-500 border bg-zinc-900/40 backdrop-blur-xl space-y-2">
    <p className="text-[15px] font-bold text-zinc-200">Total Wallet Points:</p>
    <div className="flex items-baseline justify-between">
       <h2 className="text-4xl font-black text-cyan-400 tracking-tighter">2,60,000</h2>
       <div className="text-right flex flex-col leading-none">
          <span className="text-3xl font-black text-yellow-500 lowercase">pt</span>
          <span className="text-3xl font-black text-yellow-500 lowercase">s</span>
       </div>
    </div>
    <div className="pt-2">
       <p className="text-[13px] font-medium text-zinc-500">Updated Balance: <span className="text-cyan-500 font-bold">~ ₹ 26,000</span></p>
       <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">INR</span>
    </div>
  </div>
);
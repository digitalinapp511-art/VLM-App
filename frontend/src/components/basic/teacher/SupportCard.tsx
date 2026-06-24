import React from "react";
import { Headset, Phone, MessageSquare, ShieldCheck, ChevronRight } from "lucide-react";
const SupportCard: React.FC = () => {
  return (
    <div className="p-6 rounded-[32px] border-2 border-cyan-400/40 bg-zinc-950/60 backdrop-blur-xl space-y-6 shadow-xl">
      <div className="flex gap-4">
        <div className="shrink-0 p-3 h-fit rounded-2xl bg-cyan-400/10 text-cyan-400 border border-cyan-400/20">
          <Headset size={32} strokeWidth={1.5} />
        </div>
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-white uppercase tracking-tight">
              Need Assistance?
            </h3>
            <p className="text-[13px] text-zinc-400 font-medium leading-relaxed">
              Have questions about reapplying or your rejection? Our support team is here to help.
            </p>
          </div>

          <ul className="space-y-2.5">
            <li className="flex items-center gap-3 text-zinc-200">
              <Phone size={18} className="text-zinc-500" />
              <span className="text-[13px] font-bold tracking-tight">+1-800-VLM-HELP</span>
            </li>
            <li className="flex items-center gap-3 text-zinc-200">
              <MessageSquare size={18} className="text-zinc-500" />
              <span className="text-[13px] font-bold tracking-tight">VLM Academy Live Chat</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="pt-4 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2 opacity-60">
           <ShieldCheck size={16} className="text-zinc-300" />
           <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Secure-Verified</span>
        </div>
        <button className="flex items-center gap-1 text-[13px] font-black text-cyan-400 uppercase tracking-tight group transition-all">
          Open a Support Ticket <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default SupportCard;
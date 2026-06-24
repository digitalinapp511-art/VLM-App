// src/pages/LiveActivity.tsx
import { motion } from "framer-motion";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import BottomNav from "@/components/layout/BottomNav";
import { Star, Clock } from "lucide-react";
export default function LiveActivity() {
  return (
    <div className={cn(bgCss, "min-h-screen w-full bg-[#050505] text-white flex flex-col items-center pb-24 overflow-x-hidden")}>
      
      {/* --- BRANDING HEADER --- */}
      <header className="w-full max-w-xl text-center pt-8 mb-4 px-6">
        <h1 style={{ fontFamily: 'Cinzel, serif' }} className="text-xl font-bold tracking-[0.2em] text-white/90 uppercase">
          VLM ACADEMY
        </h1>
        <h2 className="mt-8 text-3xl font-bold tracking-tight">Live Activity</h2>
        <p className="text-sm text-white/60 mt-2">
          Current Session Type: <span className="text-white font-semibold">Live Class</span>
        </p>
      </header>

      {/* --- LIVE INDICATOR --- */}
      <div className="flex items-center gap-3 mb-6">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.6, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="h-4 w-4 bg-[#22c55e] rounded-full shadow-[0_0_15px_rgba(34,197,94,0.6)]"
        />
        <span className="text-xl font-bold text-[#D4AF37] tracking-wide">Live Now</span>
      </div>

      <main className="w-full max-w-xl px-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* --- MAIN LIVE CARD --- */}
        <section className="relative p-[1px] rounded-[2.5rem] bg-gradient-to-b from-[#D4AF37] to-transparent">
          <div className="bg-[#0a0a0a] rounded-[2.5rem] p-8 space-y-6">
            
            {/* Teacher Info */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-[#D4AF37]/30">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" />
                <AvatarFallback>SC</AvatarFallback>
              </Avatar>
              <h3 className="text-2xl font-bold tracking-tight">Dr. Sarah Chen</h3>
            </div>

            {/* Details */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-xl border border-[#D4AF37]/40 bg-[#D4AF37]/5 text-[#D4AF37]">
                  <Star size={20} />
                </div>
                <span className="text-lg font-medium text-white/90">Mathematics</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-2 rounded-xl border border-[#D4AF37]/40 bg-[#D4AF37]/5 text-[#D4AF37]">
                  <Clock size={20} />
                </div>
                <span className="text-lg font-medium text-white/90">9:30 AM - 10:30 AM</span>
              </div>
            </div>

            {/* PROGRESS SECTION */}
            <div className="pt-4">
              <div className="bg-white/5 rounded-3xl p-6 border border-white/5 space-y-4">
                <div className="relative h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '60%' }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute h-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] rounded-full"
                  />
                  <motion.div 
                    initial={{ left: 0 }}
                    animate={{ left: '60%' }}
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_15px_white]"
                  />
                </div>
                
                <div className="flex justify-between items-center text-[11px] font-bold text-white/40 uppercase tracking-tighter">
                  <span>9:30 AM</span>
                  <span className="text-white/60">32 mins remaining</span>
                  <span>40 mins</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- FOOTER LINK --- */}
        <div className="text-center">
          <button className="text-[#D4AF37] font-bold underline decoration-[#D4AF37]/40 underline-offset-8 hover:text-[#e5c158] transition-colors">
            View Full Schedule
          </button>
        </div>

      </main>

      <BottomNav />
    </div>
  );
}
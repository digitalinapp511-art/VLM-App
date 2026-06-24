// src/pages/ParentDashboard.tsx
import { motion } from "framer-motion";
import { Award, Clock, FileText, CheckCircle2, ShieldCheck, Cpu, Users } from "lucide-react";
import ParentLayout from "@/components/layout/ParentLayout";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
export default function ParentDashboard() {
  return (
    <ParentLayout>
      {/* BRANDING HEADER */}
      <header className="text-center mb-10">
        <h1 style={{ fontFamily: 'Cinzel, serif' }} className="text-3xl font-bold tracking-[0.1em] text-[#D4AF37]">
          VLMACADEMY
        </h1>
        <p className="text-[10px] tracking-[0.4em] font-bold text-[#D4AF37]/70 uppercase mt-1">
          Parent Module
        </p>
      </header>

      {/* PROFILE SECTION */}
      <section className="flex items-center gap-6 mb-10">
        <div className="relative">
          {/* Avatar Glow */}
          <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
          <div className="relative p-1 rounded-full border-2 border-white/10">
             <Avatar className="h-20 w-20 border-2 border-white/20">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ethan" />
                <AvatarFallback>EW</AvatarFallback>
             </Avatar>
          </div>
        </div>
        
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Child Profile</p>
          <h2 className="text-2xl font-bold text-white tracking-tight">Ethan Williams</h2>
          <p className="text-sm text-white/60">Grade 5A</p>
          <Button variant="outline" size="sm" className="mt-2 h-8 rounded-full bg-white/5 border-white/10 text-white/70 text-xs gap-2">
            <Users size={14} /> Switch Child
          </Button>
        </div>
      </section>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <StatCard 
          icon={Award} 
          label="Academic Score" 
          value="88%" 
          color="border-cyan-500/50" 
          iconBg="bg-cyan-500/10 text-cyan-400" 
        />
        <StatCard 
          icon={Clock} 
          label="Study Time" 
          value="4h 32m" 
          color="border-purple-500/50" 
          iconBg="bg-purple-500/10 text-purple-400" 
        />
        <StatCard 
          icon={FileText} 
          label="Weak Subjects" 
          value="Mathematics, Physics" 
          color="border-orange-500/50" 
          iconBg="bg-orange-500/10 text-orange-400" 
          isWrap
        />
        <StatCard 
          icon={CheckCircle2} 
          label="Doubt Solved" 
          value="25" 
          color="border-blue-500/50" 
          iconBg="bg-blue-500/10 text-blue-400" 
        />
      </div>

      {/* FULL WIDTH CARDS */}
      <div className="space-y-4">
        <motion.div 
          whileTap={{ scale: 0.98 }}
          className="w-full p-5 rounded-2xl border border-cyan-500/40 bg-white/5 flex items-center gap-4"
        >
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-[10px] text-white/40 font-bold uppercase">Plan Status</p>
            <p className="text-lg font-bold text-white">Active - Premium</p>
          </div>
        </motion.div>

        <motion.div 
          className="w-full p-5 rounded-2xl border border-[#D4AF37]/30 bg-white/5 flex items-center gap-4"
        >
          <div className="p-2 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37]">
            <Cpu size={24} />
          </div>
          <p className="text-xs text-white/80 leading-relaxed font-medium">
            AI Insight: Math is weak - practice recommended
          </p>
        </motion.div>
      </div>
    </ParentLayout>
  );
}

// Internal Stat Card Component
function StatCard({ icon: Icon, label, value, color, iconBg, isWrap = false }: any) {
  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className={cn("p-4 rounded-2xl border bg-white/5 flex flex-col gap-3 min-h-[110px]", color)}
    >
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", iconBg)}>
        <Icon size={20} />
      </div>
      <div className="space-y-0.5">
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-tight leading-none">{label}</p>
        <p className={cn("font-bold text-white leading-tight", isWrap ? "text-xs" : "text-xl")}>
          {value}
        </p>
      </div>
    </motion.div>
  );
}
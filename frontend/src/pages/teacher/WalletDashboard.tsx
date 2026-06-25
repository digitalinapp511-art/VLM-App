import React from "react";
import { motion } from "framer-motion";
import { 
  Home, 
  BookOpen, 
  Wallet, 
  Library, 
  User, 
  SlidersHorizontal, 
  PencilLine,
  Clock
} from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import { PointsCard, BalanceCard } from "@/components/basic/teacher/WalletStatCards";
import TransactionItem from "@/components/basic/teacher/TransactionItem";
import { PATHS } from "@/routes/paths";
import { useNavigate } from "react-router-dom";

const WalletDashboard: React.FC = () => {
  const navigate = useNavigate();


  return (
    <div className={cn("min-h-screen flex flex-col p-4 pb-28 relative", bgCss)}>
      
      {/* Header */}
      <header className="flex items-center justify-between py-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-500">
             <div className="w-4 h-4 bg-zinc-800 rounded-sm" />
          </div>
          <h1 className="text-base font-black text-white tracking-tight">Wallet Dashboard</h1>
        </div>
        <Avatar className="w-10 h-10 border-2 border-white/10">
          <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher" />
          <AvatarFallback>TH</AvatarFallback>
        </Avatar>
      </header>

      <div className="w-full max-w-xl mx-auto space-y-6">
        {/* Stats Grid */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-auto md:flex-1">
            <PointsCard points="1,250,000" inr="2,50,000" />
          </div>
          <div className="flex-1 flex flex-col gap-4">
            <BalanceCard title="Withdrawable Balance" value="1,75,000" icon={Wallet} />
            <BalanceCard title="Pending Conversion" value="5,000" icon={Clock} variant="zinc" />
          </div>
        </div>

        {/* Withdrawal Method */}
        <section className="p-6 rounded-[32px] border border-white/10 bg-zinc-950/30">
          <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.15em] mb-4">Withdrawal Method</h3>
          <div className="p-4 rounded-2xl border border-purple-500/20 bg-white/[0.02] flex items-center gap-4">
             <div className="w-12 h-10 bg-white rounded flex items-center justify-center shadow-lg">
                <div className="w-6 h-6 border-4 border-rose-500 rounded-sm" />
             </div>
             <div className="flex-1">
                <h4 className="text-sm font-black text-white">HDFC Bank</h4>
                <p className="text-[11px] font-medium text-zinc-500">Account No : **** 3033</p>
             </div>
          </div>
        </section>

        {/* Recent Transactions */}
        <section className="p-6 rounded-[40px] border border-white/5 bg-white/[0.01] backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Recent Credits & Debits</h3>
            <div className="flex gap-3 text-zinc-500">
               <SlidersHorizontal size={20} />
               <PencilLine size={20} />
            </div>
          </div>

          <div className="divide-y divide-white/5">
            <TransactionItem title="Class Points Credited" date="Sep 28, 2024" amount="1,500" type="credit" />
            <TransactionItem title="Withdrawal Completed" date="Sep 28, 2024" amount="25,000" type="debit" />
            <TransactionItem title="Class Points Credited" date="Sep 28, 2024" amount="1,500" type="credit" />
          </div>
        </section>
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full bg-[#0a0a0a]/95 border-t border-white/5 backdrop-blur-lg px-6 py-4 flex items-center justify-between z-50">
        <NavItem icon={<Home />} label="Home" onClick={() => navigate(PATHS.TEACHER_DASHBOARD)} />
        <NavItem icon={<BookOpen />} label="Classes" onClick={() => navigate(PATHS.TEACHER_CLASSES)} />
        <NavItem icon={<Wallet />} label="Wallet" active onClick={() => navigate(PATHS.TEACHER_WALLET)} />
        <NavItem icon={<Library />} label="Library" onClick={() => navigate(PATHS.TEACHER_LIBRARY)} />
        <NavItem icon={<User />} label="Profile" onClick={() => navigate(PATHS.TEACHER_PROFILE)} />
      </nav>
    </div>
  );
};

const NavItem = ({ icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex flex-col items-center gap-1.5 transition-all duration-300",
      active ? "text-cyan-400" : "text-zinc-600 hover:text-zinc-400"
    )}
  >
    <div className={cn("relative", active && "drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]")}>
      {React.cloneElement(icon, { size: 24, strokeWidth: active ? 2.5 : 1.5 })}
    </div>
    <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    {active && <motion.div layoutId="navDot" className="w-1 h-1 rounded-full bg-cyan-400" />}
  </button>
);

export default WalletDashboard;
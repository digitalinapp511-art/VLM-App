import React from "react";
import { motion } from "framer-motion";
import { 
  ChevronDown, Star, Users, Clock, Percent, BellOff,
  Home, BookOpen, BarChart3, Library, UserCircle
} from "lucide-react";
import { 
  LineChart, Line, XAxis,
  Tooltip, ResponsiveContainer
} from "recharts";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";

import AnalyticsHeroCard from "@/components/basic/teacher/AnalyticsHeroCard";
import AnalyticsMetricCard from "@/components/basic/teacher/AnalyticsMetricCard";

const data = [
  { name: "Sep 2024", earnings: 4000, trend: 2400 },
  { name: "Sun", earnings: 4500, trend: 2800 },
  { name: "Mon", earnings: 7000, trend: 3200 },
  { name: "Tue", earnings: 6000, trend: 5500 },
  { name: "Wed", earnings: 8000, trend: 4800 },
];

const PerformanceAnalytics: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className={cn("min-h-screen p-4 pb-28 flex flex-col items-center", bgCss)}>
      <div className="w-full max-w-xl space-y-6">
        
        {/* Header */}
        <header className="flex justify-between items-center py-4">
          <div className="space-y-1">
            <div className="w-6 h-6 rounded-md border-2 border-white/80" />
            <h1 className="text-xl font-black text-white uppercase tracking-wider">
              Performance Analytics
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-zinc-400 text-[11px] font-black uppercase">
                [SEP 2024] <ChevronDown size={14} />
             </button>
             <div className="w-10 h-10 rounded-full border-2 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
          </div>
        </header>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
          
          {/* Top Row */}
          <div className="flex gap-4">
            <motion.div variants={itemVariants} className="flex-1">
              <AnalyticsHeroCard variant="cyan" title="Average Ratings" value="4.90" trend="+0.05%" icon={<Star fill="currentColor"/>}>
                <div className="flex gap-0.5 text-cyan-400 pt-1">
                   {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
              </AnalyticsHeroCard>
            </motion.div>
            <motion.div variants={itemVariants} className="flex-1">
              <AnalyticsHeroCard variant="blue" title="Total Sessions" value="1,540" trend="+12.3%" icon={<Users />}>
                <div className="flex items-end gap-1 h-6 mt-1">
                   {[4, 7, 5, 10].map((h, i) => (
                     <div key={i} className="flex-1 bg-blue-500/40 rounded-sm" style={{ height: `${h * 10}%` }} />
                   ))}
                </div>
              </AnalyticsHeroCard>
            </motion.div>
          </div>

          {/* Middle Row */}
          <div className="grid grid-cols-3 gap-3">
             <motion.div variants={itemVariants}>
               <AnalyticsMetricCard variant="teal" icon={Clock} label="Avg. Response Speed" value="0m 25s" trend="FASTER" />
             </motion.div>
             <motion.div variants={itemVariants}>
               <AnalyticsMetricCard variant="yellow" icon={Percent} label="Acceptance Rate" value="98.5%" trend="1.5%">
                  <div className="flex items-end gap-1 h-4 mt-2">
                    {[3, 6, 8, 5, 7].map((h, i) => (
                      <div key={i} className="flex-1 bg-yellow-500/40 rounded-[2px]" style={{ height: `${h * 10}%` }} />
                    ))}
                  </div>
               </AnalyticsMetricCard>
             </motion.div>
             <motion.div variants={itemVariants}>
               <AnalyticsMetricCard variant="purple" icon={BellOff} label="Missed Requests" value="3" trend="-50%" trendDirection="down">
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-3 overflow-hidden">
                    <div className="w-1/3 h-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                  </div>
               </AnalyticsMetricCard>
             </motion.div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-12 gap-4">
             <motion.div variants={itemVariants} className="col-span-4">
                <AnalyticsMetricCard variant="zinc" icon={Users} label="Teachers Referred" value="45" trend="+20%">
                   <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-6 overflow-hidden">
                     <div className="w-1/2 h-full bg-cyan-400" />
                   </div>
                </AnalyticsMetricCard>
             </motion.div>

             <motion.div variants={itemVariants} className="col-span-8 p-6 rounded-[32px] border border-white/5 bg-white/[0.02] backdrop-blur-xl space-y-4">
                <div className="space-y-1">
                   <h3 className="text-zinc-400 text-sm font-bold">Earnings Trend</h3>
                   <p className="text-xl font-black text-white">TOTAL EARNINGS: <span className="text-zinc-400 font-medium">₹</span> 75,000</p>
                </div>
                
                <div className="h-40 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                      <Tooltip contentStyle={{ backgroundColor: "#121212", border: "none", borderRadius: "12px" }} />
                      <Line type="monotone" dataKey="earnings" stroke="#22d3ee" strokeWidth={3} dot={{ r: 4, fill: "#fff" }} />
                      <Line type="monotone" dataKey="trend" stroke="#eab308" strokeWidth={3} dot={{ r: 4, fill: "#eab308" }} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#52525b" }} dy={10} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
             </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 w-full bg-[#0a0a0a]/95 border-t border-white/5 backdrop-blur-lg px-8 py-4 flex items-center justify-between z-50">
        <NavItem icon={<Home />} label="Home" />
        <NavItem icon={<BookOpen />} label="Classes" />
        <NavItem icon={<BarChart3 />} label="Analytics" active />
        <NavItem icon={<Library />} label="Library" />
        <NavItem icon={<UserCircle />} label="Profile" />
      </nav>
    </div>
  );
};

const NavItem = ({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
  <button className={cn(
    "flex flex-col items-center gap-1.5 transition-all duration-300",
    active ? "text-cyan-400" : "text-zinc-600 hover:text-zinc-400"
  )}>
    <div className={cn("relative", active && "drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]")}>
      {React.cloneElement(icon, { size: 24, strokeWidth: active ? 2.5 : 1.5 })}
    </div>
    <span className="text-[10px] font-bold tracking-tight">{label}</span>
    {active && <motion.div layoutId="navDot" className="w-1 h-1 rounded-full bg-cyan-400 mt-1" />}
  </button>
);

export default PerformanceAnalytics;
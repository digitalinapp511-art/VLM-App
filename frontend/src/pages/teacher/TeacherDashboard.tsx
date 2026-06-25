import React from "react";
import { motion } from "framer-motion";
import { MessageSquare, Bell, Rss, AlertTriangle, Star } from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import StatCard from "@/components/basic/teacher/StatCard";
import { LiveClassItem, ReviewCard, ReferralCard } from "@/components/basic/teacher/Dashboards";

const TeacherDashboard: React.FC = () => {
  return (
    <div className={cn("min-h-screen flex flex-col items-center bg-black p-4 pb-12", bgCss)}>

      <div className="w-full max-w-xl lg:max-w-4xl flex flex-col gap-6">

        {/* Header */}
        <header className="flex justify-between items-center py-4 px-2">
          <div className="space-y-0.5">
            <h1 className="text-xl font-black text-white leading-none tracking-tight">VLM Academy</h1>
            <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Teacher App</p>
          </div>
          <div className="relative">
            <Avatar className="w-12 h-12 border-2 border-white/10 shadow-xl">
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" />
              <AvatarFallback>SJ</AvatarFallback>
            </Avatar>
            <div className="absolute top-0 right-0 w-3 h-3 bg-cyan-400 rounded-full border-2 border-black" />
          </div>
        </header>

        <section className="mb-2">
          <h2 className="text-3xl font-black text-white tracking-tight">Welcome, Teacher Sarah</h2>
        </section>

        {/* Top Stats Grid - 3 cols on laptop, 1-2 on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <StatCard title="Today's Earnings" value="$1,250.00" trend="up" variant="cyan" />
          <StatCard title="Total Points" value="7,850 pts" variant="purple" />
          <StatCard title="Wallet Balance" value="$10,400.00" variant="blue" />
        </div>

        {/* Secondary Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            title="Total Sessions"
            value="145"
            subValue="Sessions"
            icon={MessageSquare}
            variant="cyan"
          />
          <StatCard
            title="Missed Requests"
            value="3"
            subValue="Requests"
            icon={AlertTriangle}
            variant="purple"
          />
        </div>

        {/* Overall Rating Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-7 rounded-[32px] border border-white/5 bg-zinc-900/40 backdrop-blur-xl relative"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest leading-none">Rating</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-4xl font-black text-white tracking-tighter">4.9</h3>
                <span className="text-zinc-500 font-bold text-sm tracking-tight lowercase">out of 5</span>
              </div>
              <div className="flex gap-1 text-purple-400 mt-2">
                {[...Array(5)].map((_, i) => <Star key={i} size={18} fill={i < 4 ? "currentColor" : "none"} className={i === 4 ? "opacity-30" : ""} />)}
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-800/40 text-zinc-500">
              <MessageSquare size={24} />
            </div>
          </div>
        </motion.div>

        {/* Main Dashboard Body - Two Column Layout for Laptop (lg) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">

          {/* Left Side: Upcoming Classes */}
          <section className="space-y-5">
            <h3 className="text-lg font-black text-white uppercase tracking-wider px-1">Upcoming Live Classes</h3>
            <div className="flex flex-col gap-3">
              <LiveClassItem title="Advanced Calculus" time="11:00 AM" />
              <LiveClassItem title="Advanced Forms" time="11:00 AM" />
              <LiveClassItem title="Advanced Terms" time="11:00 AM" />
              <LiveClassItem title="Advanced" time="11:00 AM" />
            </div>
          </section>

          {/* Right Side: Notifications, Reviews, Referral */}
          <section className="space-y-8">
            {/* Notifications Feed */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-lg font-black text-white uppercase tracking-wider">Notifications</h3>
                <span className="text-xl font-black text-white">3</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-full bg-zinc-900/60 border border-white/5 text-zinc-400">
                <div className="flex items-center gap-3">
                  <Bell size={18} className="text-blue-400" />
                  <span className="text-sm font-bold text-blue-400/80">Feed</span>
                </div>
                <div className="flex gap-4">
                  <MessageSquare size={18} />
                  <Rss size={18} />
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="space-y-4">
              <h3 className="text-lg font-black text-white uppercase tracking-wider px-1">Recent Reviews</h3>
              <ReviewCard />
            </div>

            {/* Referral */}
            <div className="space-y-4">
              <h3 className="text-lg font-black text-white uppercase tracking-wider px-1">Refer and Earn</h3>
              <ReferralCard />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
import React from "react";
import { motion } from "framer-motion";
import {
  Search, FileText, Calendar, Video, DollarSign,
  ArrowRightLeft, Bug, Tv, ClipboardCheck,
  Star, Users, MessageCircle, Home, BookOpen,
  Wallet, Library, User, StarIcon
} from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import SupportCategoryCard from "@/components/basic/teacher/SupportCategoryCard";
import FAQItem from "@/components/basic/teacher/FAQItem";

const HelpCenter: React.FC = () => {

  const categories = [
    { icon: FileText, title: "Profile & KYC", desc: "View articles or raise a ticket" },
    { icon: Calendar, title: "Interview Issue", desc: "Manage interview issues" },
    { icon: Video, title: "Session Issue", desc: "Session problems" },
    { icon: DollarSign, title: "Wallet & Points", desc: "Wallet balance, points" },
    { icon: ArrowRightLeft, title: "Withdrawal", desc: "Withdrawal status and methods" },
    { icon: Bug, title: "Technical Bug", desc: "App issues, errors" },
    { icon: Tv, title: "Live Class Issue", desc: "Class problems" },
    { icon: ClipboardCheck, title: "Content Approval", desc: "Approval updates" },
    { icon: Star, title: "Rating Dispute", desc: "Review rating disputes" },
  ];

  return (
    <div className={cn("min-h-screen flex flex-col p-4 pb-28 relative overflow-x-hidden", bgCss)}>

      {/* Decorative Assets */}
      <div className="absolute top-40 -left-6 text-blue-500/20 blur-[1px] rotate-12">
        <StarIcon size={16} fill="currentColor" />
      </div>
      <div className="absolute top-1/2 -right-4 text-purple-500/30 blur-[1px]">
        <StarIcon size={24} fill="currentColor" />
      </div>

      {/* Header */}
      <header className="flex items-center justify-between py-4 mb-4 max-w-xl mx-auto w-full">
        <div className="space-y-0.5">
          <h1 className="text-base font-black text-white tracking-tight">Teacher Portal</h1>
          <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest leading-none">
            Dr. Elena Petrova | Faculty
          </p>
        </div>
        <Avatar className="w-10 h-10 border-2 border-white/10 shadow-lg">
          <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Elena" />
          <AvatarFallback>EP</AvatarFallback>
        </Avatar>
      </header>

      <div className="w-full max-w-xl mx-auto space-y-8">
        {/* Main Title & Search */}
        <div className="space-y-6">
          <h2 className="text-3xl font-black text-white leading-tight">
            Help Center &<br />Teacher Support
          </h2>
          <div className="relative group">
            <input
              type="text"
              placeholder="Search categories, FAQs, tickets..."
              className="w-full h-14 pl-12 pr-6 rounded-2xl border border-white/10 bg-zinc-900/50 text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 transition-all"
            />
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-cyan-400 transition-colors" />
          </div>
        </div>

        {/* Support Grid */}
        <section className="grid grid-cols-3 gap-3">
          {categories.map((cat, idx) => (
            <SupportCategoryCard key={idx} icon={cat.icon} title={cat.title} description={cat.desc} />
          ))}
          <SupportCategoryCard icon={Users} title="Referral Issue" description="Referral program problems" isFullWidth />
          <SupportCategoryCard icon={MessageCircle} title="Student Complaint" description="Student interactions" isFullWidth />
        </section>

        {/* FAQ Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-6 rounded-[40px] border-2 border-cyan-500/20 bg-zinc-950/40 backdrop-blur-2xl shadow-[0_0_50px_rgba(34,211,238,0.05)]"
        >
          <h3 className="text-[13px] font-black text-white uppercase tracking-[0.2em] mb-8">
            Frequently Asked Questions
          </h3>

          <div className="flex flex-col">
            <FAQItem question="How do I update my KYC documents?" description="View all conditions how do I update my KYC documents." />
            <FAQItem question="What is the content approval timeline?" description="What is the common content approval timeline?" />
            <FAQItem question="Dispute student rating?" description="What are the commons dispute student rating?" />
            <FAQItem question="When are points credited?" description="When are points credited where your entirety points." />
          </div>
        </motion.section>
      </div>

      {/* Persistent Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full bg-[#0a0a0a]/95 border-t border-white/5 backdrop-blur-lg px-6 py-4 flex items-center justify-between z-50">
        <NavItem icon={<Home />} label="Home" />
        <NavItem icon={<BookOpen />} label="Classes" />
        <NavItem icon={<Wallet />} label="Wallet" />
        <NavItem icon={<Library />} label="Library" />
        <NavItem icon={<User />} label="Profile" active />
      </nav>
    </div>
  );
};

// Nav Item Helper
const NavItem = ({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) => (
  <button className={cn(
    "flex flex-col items-center gap-1.5 transition-all duration-300",
    active ? "text-cyan-400" : "text-zinc-600 hover:text-zinc-400"
  )}>
    <div className={cn("relative transition-transform", active && "drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] scale-110")}>
      {React.cloneElement(icon as React.ReactElement<any>, ({ size: 24, strokeWidth: active ? 2.5 : 1.5 } as any))}
    </div>
    <span className="text-[10px] font-bold uppercase tracking-widest leading-none">{label}</span>
  </button>
);

export default HelpCenter;
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Home, Calendar, MessageSquare, LogOut } from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";

import BlockedIllustration from "@/components/basic/teacher/BlockedIllustration";
import SupportButton from "@/components/basic/teacher/SupportButton";

const AccountBlocked: React.FC = () => {
  const navigate = useNavigate();

  const handleSupport = () => {
    // Navigate to support chat or ticket creation
    navigate("/teacher/support/create");
  };

  return (
    <div className={cn("min-h-screen flex flex-col p-4 pb-24 relative overflow-x-hidden bg-black", bgCss)}>

      {/* App Header */}
      <header className="flex items-center gap-4 py-8 px-2">
        <div className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center shrink-0">
          {/* VLM Logo Placeholder */}
          <div className="w-8 h-8 border-4 border-zinc-200 rounded-md" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl font-black text-white leading-tight">VLM Academy</h1>
          <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Teacher App</p>
        </div>
      </header>

      {/* Main Restriction Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "w-full max-w-xl mx-auto p-8 rounded-[48px] border border-white/5",
          "bg-zinc-900/40 backdrop-blur-3xl shadow-2xl relative flex flex-col text-center"
        )}
      >
        <BlockedIllustration />

        <div className="space-y-2 mb-8">
          <h2 className="text-2xl font-black text-white uppercase tracking-tight leading-tight">
            Access Restricted
          </h2>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">
            Account Blocked
          </h2>
        </div>

        <p className="text-zinc-400 text-[15px] leading-relaxed mb-8 px-2 font-medium">
          Your VLM Academy Teacher Account portal has been temporarily restricted due to potential policy violations. Our Trust & Safety team is reviewing recent activity on your account. A detailed explanation has been sent to your registered email address.
        </p>

        <div className="space-y-1 mb-8">
          <p className="text-[13px] font-bold text-zinc-500 uppercase tracking-widest">
            ID: VLM-ACC-BL-738
          </p>
          <p className="text-[13px] font-bold text-zinc-500 uppercase tracking-widest">
            Time: Oct 26, 2024, 02:15 PM
          </p>
        </div>

        {/* Policy Links */}
        <div className="flex items-center justify-center gap-3 text-[11px] font-bold text-zinc-500 uppercase tracking-tight mb-10">
          <button className="underline decoration-zinc-700 hover:text-zinc-300">Review Policies</button>
          <span>|</span>
          <button className="underline decoration-zinc-700 hover:text-zinc-300">Code of Conduct</button>
          <span>|</span>
          <button className="underline decoration-zinc-700 hover:text-zinc-300">Terms of Service</button>
        </div>

        <div className="space-y-6">
          <SupportButton onClick={handleSupport} />
          <p className="text-[11px] font-bold text-zinc-600 leading-tight px-6 uppercase tracking-tight">
            Our dedicated support team can help clarify this. Click to connect.
          </p>
        </div>
      </motion.div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full bg-[#0a0a0a] border-t border-white/5 py-4 px-6 flex items-center justify-between z-50">
        <NavItem icon={<Home />} label="Home" />
        <NavItem icon={<Calendar />} label="Sessions" />
        <NavItem icon={<MessageSquare />} label="Messages" />
        <NavItem icon={<LogOut />} label="Log Out" variant="danger" />
      </nav>
    </div>
  );
};

// Internal Helper for Bottom Navigation
const NavItem = ({
  icon,
  label,
  variant = "default"
}: {
  icon: React.ReactNode,
  label: string,
  variant?: "default" | "danger"
}) => (
  <button className={cn(
    "flex flex-col items-center gap-1.5 transition-all opacity-60 hover:opacity-100",
    variant === "danger" ? "text-white" : "text-zinc-500"
  )}>
    {React.cloneElement(icon as React.ReactElement<any>, ({ size: 24, strokeWidth: 1.5 } as any))}
    <span className="text-[10px] font-bold tracking-tight">{label}</span>
  </button>
);

export default AccountBlocked;
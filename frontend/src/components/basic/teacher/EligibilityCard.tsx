import React from "react";
import { ClipboardCheck, Clock } from "lucide-react";
import { motion } from "framer-motion";
import CountdownItem from "./CountdownItem";

const EligibilityCard: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 rounded-[40px] border border-white/10 bg-zinc-900/40 backdrop-blur-3xl shadow-2xl relative overflow-hidden"
    >
      {/* Icon Composition */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <ClipboardCheck size={72} className="text-rose-400/60" strokeWidth={1.5} />
          <div className="absolute -bottom-1 -right-1 bg-zinc-950 rounded-full p-1 border-2 border-rose-400 shadow-lg">
            <Clock size={20} className="text-rose-400" strokeWidth={2.5} />
          </div>
        </div>
      </div>

      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white uppercase tracking-wider">
            Reapply Eligibility
          </h2>
          <p className="text-[15px] font-bold text-zinc-400 uppercase tracking-tight">
            Application Status: <span className="text-rose-500">Rejected</span>
          </p>
        </div>

        <p className="text-sm leading-relaxed text-zinc-300 font-medium px-2">
          <span className="text-white font-bold">Reason for Failure:</span> Your profile requires additional details. Specifically, your teaching experience section needs to show at least 3 years of verified experience. Please review and provide necessary documentation.{" "}
          <span className="text-zinc-500 font-bold block mt-2">Case ID: APPL-FAIL-103</span>
        </p>

        <div className="pt-4 space-y-6">
          <h3 className="text-xs font-black text-zinc-100 uppercase tracking-[0.2em]">
            Reapply In:
          </h3>
          <div className="grid grid-cols-4 gap-2 md:gap-4 justify-items-center">
            <CountdownItem value="14" label="Days Left:" variant="cyan" />
            <CountdownItem value="08" label="Hours:" variant="cyan" />
            <CountdownItem value="25" label="Minutes:" variant="rose" />
            <CountdownItem value="42" label="Seconds:" variant="rose" />
          </div>
          
          <p className="text-[11px] font-medium text-zinc-500 italic pt-2">
            *Please update your profile before reapplying.*
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default EligibilityCard;
import React from "react";
import { motion } from "framer-motion";

const RejectionDetailsCard: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-[2.5rem] border border-red-500/20 bg-gradient-to-b from-red-500/[0.05] to-transparent backdrop-blur-xl"
    >
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-black text-white uppercase tracking-tight">
          Application Status: <span className="text-red-500">Rejected</span>
        </h2>
        
        <p className="text-zinc-400 text-[15px] leading-relaxed px-4">
          Based on our review, your application was not approved for teacher onboarding.
        </p>

        {/* Reason Box */}
        <div className="p-5 rounded-3xl bg-black/40 border border-white/5 text-center">
          <h3 className="text-zinc-100 font-bold text-sm mb-2">Reason for Rejection:</h3>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Proof of Teaching Certification verification failed: The provided document was invalid or did not meet standards.
          </p>
        </div>

        <p className="text-zinc-400 text-sm leading-relaxed pt-2">
          Please take this time to review your profile and address the feedback. <br />
          You may reapply after addressing these issues.
        </p>
      </div>
    </motion.div>
  );
};

export default RejectionDetailsCard;
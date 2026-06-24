import React from "react";
import { CalendarClock } from "lucide-react";
import { motion } from "framer-motion";

const MeetingDetailsCard: React.FC = () => {
  const details = [
    { label: "Date", value: "Wednesday, October 25, 2023" },
    { label: "Time", value: "2:00 PM (IST)" },
    { label: "Status", value: "Awaiting Meeting" },
    { label: "Meeting ID", value: "VLM-INT-XXXX" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-[28px] border border-white/10 bg-white/[0.03] backdrop-blur-md"
    >
      <h3 className="text-base font-bold text-zinc-100 mb-4 border-b border-white/5 pb-3">
        Meeting Details
      </h3>
      <div className="flex gap-4">
        <div className="shrink-0 p-3 h-fit rounded-xl bg-yellow-500/10 text-yellow-500">
          <CalendarClock size={28} />
        </div>
        <div className="space-y-1.5">
          {details.map((item, idx) => (
            <p key={idx} className="text-sm font-medium text-zinc-300">
              <span className="text-yellow-500/90 font-bold">{item.label}:</span>{" "}
              <span className="text-zinc-400">[{item.value}]</span>
            </p>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default MeetingDetailsCard;
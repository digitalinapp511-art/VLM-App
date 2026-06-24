import React from "react";
import { motion } from "framer-motion";

interface RelatedSessionCardProps {
  title: string;
}

const RelatedSessionCard: React.FC<RelatedSessionCardProps> = ({ title }) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="shrink-0 w-40 aspect-square rounded-3xl p-6 flex items-end relative overflow-hidden bg-[#1A1A1A] border border-white/5"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
      <h4 className="text-[13px] font-black text-white uppercase tracking-tighter leading-tight relative z-10">
        {title}
      </h4>
    </motion.div>
  );
};

export default RelatedSessionCard;
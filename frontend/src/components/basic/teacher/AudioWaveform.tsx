import React from "react";
import { motion } from "framer-motion";

const AudioWaveform: React.FC = () => {
  return (
    <div className="w-full h-16 flex items-center justify-center relative overflow-hidden">
      <svg width="100%" height="100%" viewBox="0 0 400 100" preserveAspectRatio="none">
        {/* Static part of waveform */}
        <line x1="0" y1="50" x2="160" y2="50" stroke="#7c3aed" strokeWidth="2.5" />
        <line x1="240" y1="50" x2="400" y2="50" stroke="#7c3aed" strokeWidth="2.5" />
        
        {/* Animated dynamic part */}
        <motion.path
          d="M 160 50 L 170 30 L 180 70 L 190 20 L 200 80 L 210 10 L 220 90 L 230 40 L 240 50"
          fill="none"
          stroke="url(#waveGradient)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{
            d: [
              "M 160 50 L 170 40 L 180 60 L 190 30 L 200 70 L 210 20 L 220 80 L 230 45 L 240 50",
              "M 160 50 L 170 20 L 180 80 L 190 10 L 200 90 L 210 30 L 220 70 L 230 35 L 240 50",
              "M 160 50 L 170 30 L 180 70 L 190 20 L 200 80 L 210 10 L 220 90 L 230 40 L 240 50",
            ],
          }}
          transition={{
            repeat: Infinity,
            duration: 0.8,
            ease: "easeInOut",
          }}
        />
        
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="50%" stopColor="#db2777" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default AudioWaveform;
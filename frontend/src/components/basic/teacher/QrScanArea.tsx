import React from "react";

const QrScanArea: React.FC = () => {
  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <div className="relative w-56 h-56 flex items-center justify-center">
        {/* Glow Effect */}
        <div className="absolute inset-0 rounded-full bg-cyan-400/10 blur-3xl" />
        
        {/* Progress Ring / Border */}
        <div className="absolute inset-0 rounded-full border border-cyan-400/20" />
        <div className="absolute inset-2 rounded-full border-2 border-cyan-400/40 shadow-[0_0_40px_rgba(34,211,238,0.15)]" />
        
        {/* QR Placeholder Circle */}
        <div className="w-48 h-48 rounded-full bg-[#0a0a0a] flex items-center justify-center relative z-10 shadow-2xl">
           <div className="w-32 h-32 opacity-20 border-2 border-dashed border-cyan-400 rounded-lg" />
        </div>
      </div>
      
      <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
        Direct Invite QR | <span className="text-zinc-300">Scan to Join</span>
      </p>
    </div>
  );
};

export default QrScanArea;
import React from "react";
import { ArrowLeft, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SessionDetailHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between px-4 py-4 sticky top-0 bg-background/80 backdrop-blur-md z-50">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <ArrowLeft size={28} strokeWidth={2.5} />
        </button>
        <h1 className="text-xl font-black text-white uppercase tracking-tight">
          Session Detail
        </h1>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)] bg-zinc-900" />
        <button className="relative p-1 text-white">
          <Bell size={24} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-black" />
        </button>
      </div>
    </header>
  );
};

export default SessionDetailHeader;
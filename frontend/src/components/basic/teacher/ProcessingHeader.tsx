import React from "react";
import { ChevronLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const ProcessingHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between px-4 py-6 w-full max-w-xl mx-auto">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-2 h-10 flex items-center gap-2 hover:bg-zinc-800"
      >
        <ChevronLeft size={18} className="text-zinc-400" />
        <span className="text-zinc-200 font-bold text-xs uppercase tracking-wider">Back</span>
      </Button>

      <div className="flex items-center gap-3">
        <div className="w-5 h-5 bg-white rounded-md" />
        <h1 className="text-zinc-100 font-black text-sm uppercase tracking-[0.15em]">
          My Recordings
        </h1>
      </div>

      <Button variant="ghost" size="icon" className="text-zinc-100">
        <Search size={22} strokeWidth={2.5} />
      </Button>
    </header>
  );
};

export default ProcessingHeader;
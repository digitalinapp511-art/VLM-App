import React from "react";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

import WhiteboardToolbar from "@/components/basic/teacher/WhiteboardToolbar";
import TeacherOverlayCard from "@/components/basic/teacher/TeacherOverlayCard";
const WhiteboardSession: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex flex-col bg-zinc-50 font-sans select-none">
      {/* Header */}
      <header className="flex items-center gap-3 p-4 bg-white/50 backdrop-blur-sm sticky top-0 z-30">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-blue-500 font-bold text-sm"
        >
          <ChevronLeft size={20} /> Back
        </button>
        <h1 className="text-[11px] font-black text-zinc-800 tracking-widest uppercase opacity-80">
          Live Session | Advanced Calculus
        </h1>
      </header>

      {/* Main Whiteboard Area */}
      <main className={cn(
        "flex-1 w-full max-w-xl mx-auto relative overflow-hidden",
        "bg-gradient-to-br from-white via-zinc-50 to-zinc-100"
      )}>
        <TeacherOverlayCard />

        {/* Mocked Handwriting/Canvas Content */}
        <div className="p-10 pt-20 space-y-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 font-serif text-[#1e293b]"
          >
            <div className="text-3xl italic">
              f(x) = x³ - 3x² + 2
            </div>
            
            <div className="text-xl font-medium tracking-tight">
              Find critical points.
            </div>

            <div className="text-2xl italic text-blue-500">
              f'(x) = 3x² - 6x = 0
            </div>

            <div className="text-2xl italic text-blue-500">
              3x(x - 2) = 0
            </div>

            <div className="text-xl">
              So, <span className="text-rose-500 underline decoration-2 underline-offset-8 decoration-rose-300">x = 0</span> or <span className="text-rose-500 underline decoration-2 underline-offset-8 decoration-rose-300">x = 2</span>
            </div>

            <div className="pt-10 text-xl font-medium tracking-tight">
              Find local max/min:
            </div>

            <div className="grid grid-cols-2 items-center">
               <div className="text-2xl italic space-y-4">
                  <p>f(0) = <span className="text-rose-500">2</span></p>
                  <p>f(2) = <span className="text-rose-500">-2</span></p>
               </div>

               {/* Mocked Graph SVG */}
               <div className="relative">
                  <svg viewBox="0 0 160 160" className="w-full">
                    <line x1="0" y1="80" x2="160" y2="80" stroke="#4a5568" strokeWidth="1.5" />
                    <line x1="80" y1="0" x2="80" y2="160" stroke="#4a5568" strokeWidth="1.5" />
                    <path 
                      d="M 20 150 Q 50 10, 80 80 T 140 10" 
                      fill="none" 
                      stroke="#1e293b" 
                      strokeWidth="2.5" 
                    />
                    <circle cx="80" cy="80" r="4" className="fill-green-500" />
                    <circle cx="115" cy="125" r="4" className="fill-rose-500" />
                    <text x="85" y="75" className="text-[10px] fill-green-600 font-bold">(0,2)</text>
                    <text x="120" y="140" className="text-[10px] fill-rose-600 font-bold">(2,-2)</text>
                  </svg>
               </div>
            </div>
          </motion.div>
        </div>

        {/* Toolbar Integration */}
        <WhiteboardToolbar />
      </main>
    </div>
  );
};

export default WhiteboardSession;

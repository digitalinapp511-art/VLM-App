// src/pages/AddChild.tsx
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Info } from "lucide-react";

import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { InputSection } from "@/components/basic/parent/InputSection";
import { QRSection } from "@/components/basic/parent/QRSection";
import { SendRequestButton } from "@/components/basic/parent/SendRequestButton";

// const goldColor = "#D4AF37";

export default function AddChild() {
  const navigate = useNavigate();

  return (
    <div className={cn(bgCss, "min-h-screen w-full flex flex-col items-center p-6 bg-[#050505] overflow-x-hidden")}>
      
      {/* --- HEADER --- */}
      <header className="w-full max-w-xl relative flex flex-col items-center pt-4 pb-12">
        <div className="absolute left-0 top-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md text-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>

        <div className="text-center mt-2">
          <h2 className="text-3xl font-bold tracking-[0.15em] text-[#D4AF37] mb-1" style={{ fontFamily: 'Cinzel, serif' }}>
            VLMACADEMY
          </h2>
          <p className="text-[10px] tracking-[0.4em] font-bold text-[#D4AF37]/80 uppercase">
            Parent Module
          </p>
        </div>

        <h1 className="mt-10 text-3xl font-bold text-white tracking-tight">
          Add Your Child
        </h1>
      </header>

      {/* --- CONTENT CARD --- */}
      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl relative"
      >
        {/* Subtle purple glow effect on card edge */}
        <div className="absolute -right-4 top-1/4 w-1 h-32 bg-purple-500/30 blur-xl rounded-full" />

        <Card className="border-white/5 bg-[#1a1a1a]/40 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl">
          <CardContent className="p-6 sm:p-8 space-y-6">
            
            <InputSection 
              type="id"
              label="Enter Student ID"
              placeholder="e.g., VLM-12345"
            />

            <Divider />

            <InputSection 
              type="mobile"
              label="Enter Mobile Number"
              placeholder="Enter child's school number"
            />

            <Divider />

            <QRSection />

          </CardContent>
        </Card>

        {/* --- FOOTER ACTION --- */}
        <div className="mt-12 flex flex-col items-center gap-4">
          <SendRequestButton onClick={() => console.log("Request Sent")} />
          
          <div className="flex items-center gap-2 text-white/40 text-xs font-medium">
            <span>Child approval required</span>
            <Info size={14} />
          </div>
        </div>
      </motion.main>
    </div>
  );
}

const Divider = () => (
  <div className="flex items-center gap-4 px-2">
    <div className="h-[1px] flex-1 bg-white/10" />
    <span className="text-[10px] uppercase font-bold text-white/20 tracking-widest">or</span>
    <div className="h-[1px] flex-1 bg-white/10" />
  </div>
);
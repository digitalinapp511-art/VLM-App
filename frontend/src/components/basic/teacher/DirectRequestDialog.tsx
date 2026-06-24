import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Clock, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DirectRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestData?: {
    studentName: string;
    grade: string;
    topic: string;
    description: string;
    expiresIn: string;
  };
}

const DirectRequestDialog: React.FC<DirectRequestDialogProps> = ({ 
  open, 
  onOpenChange,
  requestData = {
    studentName: "Aisha Sharma",
    grade: "Grade 11 - JEE Prep",
    topic: "Calculus Doubts",
    description: "Optimization Problems. Aisha needs a quick 1-on-1 session to clarify concepts on maxima/minima applications. She has specifically requested you.",
    expiresIn: "5m 30s"
  }
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] md:max-w-md bg-transparent border-none p-0 shadow-none outline-none overflow-visible">
        {/* Hidden titles for screen readers (Accessibility) */}
        <div className="sr-only">
          <DialogTitle>Preferred Teacher Request</DialogTitle>
          <DialogDescription>Incoming direct request from student</DialogDescription>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className={cn(
            "relative w-full p-6 md:p-8 rounded-[40px] border-2 border-cyan-400/60",
            "bg-gradient-to-br from-[#1c3a8a] via-[#0a0f1d] to-[#080b16]",
            "shadow-[0_0_50px_rgba(34,211,238,0.25)]"
          )}
        >
          {/* Floating Top Badge */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-50">
            <div className="bg-[#facc15] px-6 py-2 rounded-xl shadow-[0_0_20px_rgba(250,204,21,0.4)] whitespace-nowrap">
              <span className="text-black font-black text-[11px] uppercase tracking-widest">
                Preferred Teacher Request
              </span>
            </div>
          </div>

          {/* Student Header */}
          <div className="flex items-center gap-4 mb-6 mt-2">
            <Avatar className="w-16 h-16 border-2 border-white/10 ring-4 ring-white/5">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${requestData.studentName}`} />
              <AvatarFallback>AS</AvatarFallback>
            </Avatar>
            <div className="space-y-0.5">
              <h3 className="text-2xl font-black text-white tracking-tight leading-tight">
                {requestData.studentName}
              </h3>
              <p className="text-zinc-400 text-sm font-medium opacity-80">
                {requestData.grade}
              </p>
            </div>
          </div>

          {/* Info Badge */}
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#1e2a4a]/40 border border-white/5 mb-6">
            <div className="w-5 h-5 rounded-md bg-yellow-500/10 flex items-center justify-center border border-yellow-500/30">
              <ShieldCheck className="text-yellow-500" size={12} strokeWidth={3} />
            </div>
            <span className="text-cyan-400 font-bold text-[12px] tracking-tight">
              tutor since 2021 | followed student
            </span>
          </div>

          {/* Body Content */}
          <div className="space-y-3 mb-8">
            <h2 className="text-xl font-black text-white tracking-tight">
              Direct Request - {requestData.topic}
            </h2>
            <p className="text-zinc-400 text-[14px] leading-relaxed font-medium">
              {requestData.description}
            </p>
          </div>

          {/* Footer Metadata */}
          <div className="flex items-center justify-between mb-8">
            <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              <span className="text-zinc-500 text-[13px] font-serif italic">dy/dx</span>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20">
              <Clock className="text-rose-500" size={14} />
              <span className="text-rose-500 font-bold text-[13px]">
                Expires in: <span className="font-black">{requestData.expiresIn}</span>
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-14 rounded-3xl border-zinc-700 bg-transparent text-white font-black uppercase tracking-widest text-xs hover:bg-white/5"
            >
              Decline
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              className={cn(
                "flex-1 h-14 rounded-3xl font-black uppercase tracking-widest text-xs",
                "bg-gradient-to-r from-blue-600 to-blue-800 text-white",
                "border border-cyan-400/30 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:brightness-110"
              )}
            >
              Accept Request
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default DirectRequestDialog;
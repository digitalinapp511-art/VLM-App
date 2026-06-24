import React from "react";
import { FileText, FileUp } from "lucide-react";
import { cn } from "@/lib/utils";

const ResumeUploadZone: React.FC = () => {
  return (
    <div className="relative group cursor-pointer">
      <div className={cn(
        "flex flex-col items-center justify-center p-10 rounded-[32px] border-2 border-dashed transition-all",
        "border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20"
      )}>
        <div className="p-3 bg-yellow-500/10 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
          <FileText className="text-yellow-500" size={32} />
        </div>
        
        <h4 className="text-zinc-100 font-bold text-lg mb-1">Tap to Upload Resume</h4>
        <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">
          (PDF, DOCX, Max 10MB)
        </p>
        
        <div className="absolute bottom-6 right-6 text-yellow-500/40 group-hover:text-yellow-500 transition-colors">
           <FileUp size={24} />
        </div>
      </div>
      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept=".pdf,.docx" />
    </div>
  );
};

export default ResumeUploadZone;
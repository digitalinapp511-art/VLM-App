import React from "react";
import { FileText, FileUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResumeUploadZoneProps {
  fileName?: string;
  onUpload: (file: File) => void;
  isUploading?: boolean;
}

const ResumeUploadZone: React.FC<ResumeUploadZoneProps> = ({ fileName, onUpload, isUploading }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div className="relative group cursor-pointer">
      <div className={cn(
        "flex flex-col items-center justify-center p-10 rounded-[32px] border-2 border-dashed transition-all",
        "border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20"
      )}>
        <div className="p-3 bg-yellow-500/10 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
          {isUploading ? (
            <Loader2 className="animate-spin text-yellow-500 w-8 h-8" />
          ) : (
            <FileText className="text-yellow-500" size={32} />
          )}
        </div>
        
        {isUploading ? (
          <h4 className="text-zinc-400 font-bold text-lg mb-1 animate-pulse">Uploading Resume...</h4>
        ) : fileName ? (
          <>
            <h4 className="text-green-400 font-bold text-lg mb-1 truncate max-w-xs">{fileName}</h4>
            <p className="text-zinc-500 text-xs font-medium">Click to replace document</p>
          </>
        ) : (
          <>
            <h4 className="text-zinc-100 font-bold text-lg mb-1">Tap to Upload Document / Resume</h4>
            <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">
              (PDF, PNG, JPG, JPEG, Max 10MB)
            </p>
          </>
        )}
        
        <div className="absolute bottom-6 right-6 text-yellow-500/40 group-hover:text-yellow-500 transition-colors">
           <FileUp size={24} />
        </div>
      </div>
      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" onChange={handleFileChange} />
    </div>
  );
};

export default ResumeUploadZone;

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type UploadStatus = "PENDING" | "UPLOADED" | "VERIFIED" | "REJECTED";

interface DocumentUploadCardProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: UploadStatus;
  onUpload: (id: string) => void;
  topRightIcon?: React.ReactNode;
}

const DocumentUploadCard: React.FC<DocumentUploadCardProps> = ({
  id,
  title,
  description,
  icon,
  status,
  onUpload,
  topRightIcon,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative p-6 rounded-[32px] border border-white/10",
        "bg-[#1A1A1A]/60 backdrop-blur-xl shadow-xl overflow-hidden"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          {/* Main Icon Container */}
          <div className="w-14 h-14 rounded-2xl bg-zinc-800/80 flex items-center justify-center border border-white/5 text-blue-400">
            {React.isValidElement(icon)
              ? React.cloneElement(icon as React.ReactElement<any>, { size: 28 })
              : icon}
          </div>

          {/* Status Badge */}
          <div className="flex flex-col">
            <span
              className={cn(
                "text-[10px] font-bold tracking-[0.15em] uppercase",
                status === "PENDING" ? "text-yellow-500" : "text-green-500"
              )}
            >
              {status}
            </span>
          </div>
        </div>

        {/* Top Right Placeholder Icon */}
        {topRightIcon && (
          <div className="w-10 h-6 bg-zinc-800/60 rounded-md flex items-center justify-center opacity-40">
            {React.isValidElement(topRightIcon)
              ? React.cloneElement(topRightIcon as React.ReactElement<any>, { size: 14 })
              : topRightIcon}
          </div>
        )}
      </div>

      <div className="flex items-end justify-between gap-4 mt-6">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-zinc-100 tracking-tight">
            {title}
          </h3>
          <p className="text-[13px] text-zinc-500 font-medium">
            {description}
          </p>
        </div>

        <Button
          onClick={() => onUpload(id)}
          className={cn(
            "h-10 px-6 rounded-2xl text-xs font-bold tracking-widest uppercase transition-all",
            "bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-400"
          )}
        >
          UPLOAD
        </Button>
      </div>
    </motion.div>
  );
};

export default DocumentUploadCard;
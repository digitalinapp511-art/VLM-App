import React from "react";
import { Lock, Ban } from "lucide-react";
import { cn } from "@/lib/utils";

interface InfoBadgeProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  variant?: "blue" | "purple";
}

const InfoBadge: React.FC<InfoBadgeProps> = ({ icon, title, subtitle, variant = "blue" }) => {
  const styles = {
    blue: "border-blue-500/30 bg-blue-500/5",
    purple: "border-purple-500/30 bg-purple-500/5",
  };

  return (
    <div className={cn(
      "flex items-center gap-4 p-4 rounded-2xl border transition-all w-full",
      styles[variant]
    )}>
      <div className="text-zinc-300">
        {React.cloneElement(icon as React.ReactElement<any>, ({ size: 24, strokeWidth: 1.5 } as any))}
      </div>
      <div className="flex flex-col">
        <span className="text-[11px] font-bold text-zinc-200 tracking-tight">{title}</span>
        <span className="text-[10px] text-zinc-500 font-medium">{subtitle}</span>
      </div>
    </div>
  );
};

export const RecordingSecurityDetails: React.FC = () => {
  return (
    <div className="grid grid-cols-1 gap-3 w-full max-w-[180px]">
      <InfoBadge
        icon={<Lock />}
        title="App-Only"
        subtitle="Playback"
        variant="blue"
      />
      <InfoBadge
        icon={<Ban />}
        title="No Downloads"
        subtitle="Allowed"
        variant="purple"
      />
    </div>
  );
};
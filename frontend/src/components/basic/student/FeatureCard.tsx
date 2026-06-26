import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FeatureCardProps {
  icon: React.ReactNode;
  bg: string;
  title: string;
  desc?: string;
  subDesc?: string;
  isNew?: boolean;
  glow: string;
  to?: string;
}

export default function FeatureCard({ icon, bg, title, desc, subDesc, isNew, glow, to }: FeatureCardProps) {
  const content = (
    <Card className={cn("bg-[#1a1a1a]/40 border rounded-3xl p-5 transition-all active:scale-95 cursor-pointer overflow-hidden relative h-full", glow, bg)}>
      {isNew && (
        <Badge className="absolute top-2 right-2 bg-white text-black font-black text-[8px] rounded-sm h-4 px-1">NEW</Badge>
      )}
      <div className="space-y-4 flex flex-col items-center text-center h-full justify-center">
        <div className="p-3 bg-white/5 rounded-2xl">{icon}</div>
        <div className="space-y-1">
          <h3 className="text-[10px] font-black tracking-widest text-white/90">{title}</h3>
          {desc && <p className="text-[9px] text-white/50">{desc}</p>}
          {subDesc && <p className="text-[8px] text-green-400 font-bold">{subDesc}</p>}
        </div>
      </div>
    </Card>
  );

  if (to) {
    return <Link to={to} className="block h-full">{content}</Link>;
  }

  return content;
}

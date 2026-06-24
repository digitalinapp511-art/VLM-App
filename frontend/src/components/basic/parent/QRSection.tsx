import { QrCode, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export const QRSection = () => {
  return (
    <div className="flex items-center gap-5">
      <div className="flex-shrink-0 w-14 h-14 rounded-2xl border border-[#D4AF37]/40 bg-[#D4AF37]/5 flex items-center justify-center">
        <QrCode className="text-[#D4AF37]" size={28} />
      </div>
      <div className="flex-1 space-y-1.5">
        <Label className="text-white/90 text-sm font-bold tracking-wide uppercase text-[11px] opacity-70">
          Scan QR Code
        </Label>
        <Button 
          variant="outline" 
          className="w-full h-12 rounded-xl border-[#D4AF37]/50 bg-[#D4AF37]/10 text-[#D4AF37] font-bold hover:bg-[#D4AF37]/20 flex justify-between px-6"
        >
          <span className="flex-1 text-center">Scan Now</span>
          <Camera size={18} />
        </Button>
      </div>
    </div>
  );
};
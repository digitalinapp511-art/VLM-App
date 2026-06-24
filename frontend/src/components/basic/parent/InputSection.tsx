import { Contact2, Smartphone, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InputSectionProps {
  type: 'id' | 'mobile';
  label: string;
  placeholder: string;
}

export const InputSection = ({ type, label, placeholder }: InputSectionProps) => {
  const Icon = type === 'id' ? Contact2 : Smartphone;

  return (
    <div className="flex items-center gap-5">
      <div className="flex-shrink-0 w-14 h-14 rounded-2xl border border-[#D4AF37]/40 bg-[#D4AF37]/5 flex items-center justify-center">
        <Icon className="text-[#D4AF37]" size={28} />
      </div>
      <div className="flex-1 space-y-1.5">
        <Label className="text-white/90 text-sm font-bold tracking-wide uppercase text-[11px] opacity-70">
          {label}
        </Label>
        <div className="relative">
          <Input 
            placeholder={placeholder}
            className="h-12 bg-black/40 border-white/5 rounded-xl text-white placeholder:text-white/20 focus-visible:ring-[#D4AF37]/30"
          />
          {type === 'id' && <Pencil className="absolute right-3 top-1/2 -translate-y-1/2 text-[#D4AF37]" size={16} />}
        </div>
      </div>
    </div>
  );
};
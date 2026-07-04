import { Contact2, Smartphone, Clipboard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InputSectionProps {
  type: 'id' | 'mobile';
  label: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
}

export const InputSection = ({ type, label, placeholder, value, onChange }: InputSectionProps) => {
  const Icon = type === 'id' ? Contact2 : Smartphone;

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onChange(text.trim());
      }
    } catch (err) {
      console.error("Failed to read clipboard: ", err);
    }
  };

  return (
    <div className="flex items-center gap-5">
      <div className="flex-shrink-0 w-14 h-14 rounded-2xl border border-[#D4AF37]/40 bg-[#D4AF37]/5 flex items-center justify-center">
        <Icon className="text-[#D4AF37]" size={28} />
      </div>
      <div className="flex-grow flex-1 space-y-1.5">
        <Label className="text-white/90 text-sm font-bold tracking-wide uppercase text-[11px] opacity-70">
          {label}
        </Label>
        <div className="relative">
          <Input 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="h-12 bg-black/40 border-white/5 rounded-xl text-white placeholder:text-white/20 focus-visible:ring-[#D4AF37]/30"
          />
          {type === 'id' && (
            <button
              type="button"
              onClick={handlePaste}
              title="Paste from clipboard"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#D4AF37] hover:text-[#D4AF37]/80 active:scale-95 transition-all cursor-pointer"
            >
              <Clipboard size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
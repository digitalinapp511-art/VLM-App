import { Button } from "@/components/ui/button";


export const SendRequestButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <div className="relative w-full group">
      {/* Outer Cyan Glow Effect */}
      <div className="absolute inset-0 bg-cyan-500/40 blur-2xl rounded-full opacity-60 transition-all duration-500 group-hover:opacity-100 group-hover:scale-105" />
      
      <Button 
        onClick={onClick}
        className="relative w-full h-16 rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white font-bold tracking-widest text-lg shadow-2xl transition-transform active:scale-[0.98]"
      >
        Send Request
      </Button>
    </div>
  );
};
import { useNavigate } from "react-router-dom";
import { Construction, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ComingSoonPage() {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-svh w-full flex-col items-center justify-center bg-[#f4f6ff] dark:bg-[#0b081e] px-6 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <div className="absolute top-8 left-6">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-10 w-10 rounded-xl border-slate-200 dark:border-[#221c4e] bg-white dark:bg-[#161233] text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-95 transition-all shadow-sm"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft size={20} />
        </Button>
      </div>

      <div className="flex max-w-sm flex-col items-center gap-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex h-20 w-20 items-center justify-center rounded-[1.8rem] border border-violet-100 dark:border-violet-950 bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400 shadow-sm">
          <Construction className="h-10 w-10" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-xl font-black tracking-tight text-slate-800 dark:text-white uppercase">Coming Soon</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed px-4">
            We are working hard to build this experience for you. Please check back later!
          </p>
        </div>
        
        <Button
          onClick={() => navigate(-1)}
          className="h-12 w-full max-w-xs rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-400 text-white font-black text-xs uppercase tracking-wider"
        >
          Go Back
        </Button>
      </div>
    </div>
  );
}

import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Gift } from "lucide-react";
import { PATHS } from "@/routes/paths";

const ReferralCard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-8 rounded-[32px] border border-purple-500/20 bg-gradient-to-b from-purple-600/[0.08] to-transparent text-center space-y-6">
      <div className="mx-auto w-16 h-16 rounded-full bg-purple-600/20 flex items-center justify-center relative">
        <Gift className="text-yellow-500" size={32} />
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-500 border-4 border-zinc-950 flex items-center justify-center text-[10px] font-black text-white">$</div>
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Refer and Earn</h3>
        <p className="text-zinc-500 text-sm font-medium px-4">Invite other teachers and earn points!</p>
      </div>
      <Button 
        onClick={() => navigate(PATHS.REWARD_CENTER)}
        className="w-full h-12 rounded-2xl bg-gradient-to-r from-blue-700 to-blue-900 border border-white/10 text-white font-bold uppercase tracking-tight"
      >
        Refer Now
      </Button>
      <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Up to $100 per successful referral.</p>
    </div>
  );
};

export default ReferralCard;
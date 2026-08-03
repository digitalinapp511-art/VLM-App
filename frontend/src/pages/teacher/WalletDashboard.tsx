import React from "react";
import { motion } from "framer-motion";
import { 
  Home, 
  BookOpen, 
  Wallet, 
  Library, 
  User, 
  SlidersHorizontal, 
  PencilLine,
  Clock,
  ChevronRight
} from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { getAvatarUrl } from "@/helper/avatarHelper";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { teacherApi } from "@/lib/teacher-api";
import { toast } from "sonner";

import { PointsCard, BalanceCard } from "@/components/basic/teacher/WalletStatCards";
import TransactionItem from "@/components/basic/teacher/TransactionItem";
import { PATHS } from "@/routes/paths";
import { useNavigate } from "react-router-dom";

const WalletDashboard: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ["teacherProfile"],
    queryFn: teacherApi.getProfile,
  });

  const { data: walletData, isLoading } = useQuery({
    queryKey: ["teacherWallet"],
    queryFn: teacherApi.getWallet,
  });

  const wallet = walletData?.wallet || {};
  const transactions = walletData?.transactions || [];
  const pointsToInr = walletData?.pointsToInr || 10;

  const pointsVal = wallet.totalPoints || 0;
  const inrVal = pointsVal / pointsToInr;

  const withdrawableVal = wallet.withdrawableBalance || 0;
  const pendingVal = wallet.pendingConversion || 0;

  const bankName = profile?.bankDetails?.bankName || "No Bank Added";
  const accNo = profile?.bankDetails?.accountNumber 
    ? `Account No : **** ${String(profile.bankDetails.accountNumber).slice(-4)}` 
    : "No account details saved";
  const firstName = profile?.fullName?.split(" ")[0] ?? "Teacher";

  const [showBankModal, setShowBankModal] = React.useState(false);
  const [accountHolder, setAccountHolder] = React.useState("");
  const [accountNumber, setAccountNumber] = React.useState("");
  const [ifsc, setIfsc] = React.useState("");
  const [bankNameForm, setBankNameForm] = React.useState("");
  const [upiId, setUpiId] = React.useState("");
  const [savingBank, setSavingBank] = React.useState(false);

  React.useEffect(() => {
    if (profile?.bankDetails) {
      setAccountHolder(profile.bankDetails.accountHolder || "");
      setAccountNumber(profile.bankDetails.accountNumber || "");
      setIfsc(profile.bankDetails.ifsc || "");
      setBankNameForm(profile.bankDetails.bankName || "");
      setUpiId(profile.bankDetails.upiId || "");
    }
  }, [profile]);

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBank(true);
    try {
      await teacherApi.submitVerificationDocs({
        bankDetails: {
          accountHolder,
          accountNumber,
          ifsc,
          bankName: bankNameForm,
          upiId,
        }
      });
      toast.success("Bank details saved successfully!");
      setShowBankModal(false);
      queryClient.invalidateQueries({ queryKey: ["teacherProfile"] });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save bank details");
    } finally {
      setSavingBank(false);
    }
  };

  return (
    <div className={cn("min-h-screen flex flex-col p-4 pb-28 relative", bgCss)}>
      
      {/* Header */}
      <header className="flex items-center justify-between py-4 mb-6">
        <h1 className="text-base font-black text-white tracking-tight">Wallet Dashboard</h1>
        <Avatar className="w-10 h-10 border-2 border-white/10">
          <AvatarImage src={getAvatarUrl(profile?.profilePhoto, profile?.fullName || firstName, 'teacher')} />
          <AvatarFallback>{firstName?.[0] || 'T'}</AvatarFallback>
        </Avatar>
      </header>

      <div className="w-full max-w-xl mx-auto space-y-6">
        {/* Stats Layout */}
        <div className="flex flex-col gap-4">
          <PointsCard 
            points={isLoading ? "..." : pointsVal.toLocaleString("en-IN")} 
            inr={isLoading ? "..." : inrVal.toLocaleString("en-IN")} 
          />
          <div className="grid grid-cols-2 gap-4">
            <BalanceCard 
              title="Withdrawable Balance" 
              value={isLoading ? "..." : withdrawableVal.toLocaleString("en-IN")} 
              icon={Wallet} 
            />
            <BalanceCard 
              title="Pending Conversion" 
              value={isLoading ? "..." : pendingVal.toLocaleString("en-IN")} 
              icon={Clock} 
              variant="zinc" 
            />
          </div>
        </div>

        {/* Refer & Earn CTA */}
        <section 
          onClick={() => navigate(PATHS.REWARD_CENTER)}
          className="p-5 rounded-[32px] border border-cyan-500/20 bg-cyan-500/[0.02] hover:bg-cyan-500/[0.05] transition-all cursor-pointer flex justify-between items-center group relative overflow-hidden"
        >
          <div className="space-y-1">
            <span className="text-[9px] font-black text-cyan-400 uppercase tracking-[0.2em]">Refer & Earn</span>
            <h4 className="text-sm font-black text-white">Invite friends & get bonus points</h4>
            <p className="text-[11px] text-zinc-500">Earn up to 1,000 points per referral</p>
          </div>
          <ChevronRight size={18} className="text-cyan-400 group-hover:translate-x-1 transition-transform mr-1 shrink-0" />
        </section>

        {/* Withdrawal Method */}
        <section className="p-6 rounded-[32px] border border-white/10 bg-zinc-950/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.15em]">Withdrawal Method</h3>
            <button
              onClick={() => setShowBankModal(true)}
              className="text-xs font-bold text-cyan-400 hover:underline"
            >
              Add / Edit Details
            </button>
          </div>
          <div className="p-4 rounded-2xl border border-purple-500/20 bg-white/[0.02] flex items-center gap-4">
             <div className="w-12 h-10 bg-white rounded flex items-center justify-center shadow-lg shrink-0">
                <div className="w-6 h-6 border-4 border-rose-500 rounded-sm" />
             </div>
             <div className="flex-grow">
                <h4 className="text-sm font-black text-white">{bankName}</h4>
                <p className="text-[11px] font-medium text-zinc-500">{accNo}</p>
             </div>
          </div>
        </section>

        {/* Recent Transactions */}
        <section className="p-6 rounded-[40px] border border-white/5 bg-white/[0.01] backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Recent Credits & Debits</h3>
            <div className="flex gap-3 text-zinc-500">
               <SlidersHorizontal size={20} />
               <PencilLine size={20} />
            </div>
          </div>

          <div className="divide-y divide-white/5">
            {isLoading ? (
              <p className="text-zinc-500 text-xs py-4 text-center">Loading transactions...</p>
            ) : transactions.length > 0 ? (
              transactions.map((tx: any) => (
                <TransactionItem 
                  key={tx._id}
                  title={tx.description || (tx.type === "credit" ? "Points Credited" : "Withdrawal Completed")}
                  date={new Date(tx.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                  amount={tx.earningType === "audio" || tx.earningType === "video" || tx.earningType === "chat" || tx.earningType === "doubt" || tx.inrAmount > 0
                    ? `₹${(tx.inrAmount || tx.amount || 0).toLocaleString("en-IN")}`
                    : `${(tx.points || 0).toLocaleString("en-IN")} pts`}
                  type={tx.type} 
                />
              ))
            ) : (
              <p className="text-zinc-500 text-xs py-4 text-center">No transactions yet</p>
            )}
          </div>
        </section>
      </div>

      {showBankModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md p-6 rounded-[32px] border border-white/10 bg-zinc-900 shadow-2xl flex flex-col gap-4 text-white"
          >
            <h3 className="text-lg font-black tracking-tight">Bank Details</h3>
            <p className="text-xs text-zinc-400">Please provide your bank details for payouts.</p>
            <form onSubmit={handleSaveBank} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Account Holder Name</label>
                <input
                  type="text"
                  required
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-zinc-950 border border-white/10 focus:border-cyan-400 outline-none text-sm mt-1"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Bank Name</label>
                <input
                  type="text"
                  required
                  value={bankNameForm}
                  onChange={(e) => setBankNameForm(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-zinc-950 border border-white/10 focus:border-cyan-400 outline-none text-sm mt-1"
                  placeholder="e.g. HDFC Bank"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Account Number</label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-zinc-950 border border-white/10 focus:border-cyan-400 outline-none text-sm mt-1"
                  placeholder="e.g. 501002345678"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">IFSC Code</label>
                <input
                  type="text"
                  required
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-zinc-950 border border-white/10 focus:border-cyan-400 outline-none text-sm mt-1"
                  placeholder="e.g. HDFC0000123"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">UPI ID (Optional)</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-zinc-950 border border-white/10 focus:border-cyan-400 outline-none text-sm mt-1"
                  placeholder="e.g. john@okaxis"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBankModal(false)}
                  className="flex-1 h-10 rounded-full border border-white/10 bg-zinc-800 text-xs font-bold hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingBank}
                  className="flex-1 h-10 rounded-full bg-cyan-500 text-black text-xs font-bold hover:bg-cyan-400 disabled:opacity-50"
                >
                  {savingBank ? "Saving..." : "Save Details"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full bg-[#0a0a0a]/95 border-t border-white/5 backdrop-blur-lg px-6 py-4 flex items-center justify-between z-50">
        <NavItem icon={<Home />} label="Home" onClick={() => navigate(PATHS.TEACHER_DASHBOARD)} />
        <NavItem icon={<BookOpen />} label="Classes" onClick={() => navigate(PATHS.TEACHER_CLASSES)} />
        <NavItem icon={<Wallet />} label="Wallet" active onClick={() => navigate(PATHS.TEACHER_WALLET)} />
        <NavItem icon={<Library />} label="Library" onClick={() => navigate(PATHS.TEACHER_LIBRARY)} />
        <NavItem icon={<User />} label="Profile" onClick={() => navigate(PATHS.TEACHER_PROFILE)} />
      </nav>
    </div>
  );
};

const NavItem = ({ icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex flex-col items-center gap-1.5 transition-all duration-300",
      active ? "text-cyan-400" : "text-zinc-600 hover:text-zinc-400"
    )}
  >
    <div className={cn("relative", active && "drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]")}>
      {React.cloneElement(icon, { size: 24, strokeWidth: active ? 2.5 : 1.5 })}
    </div>
    <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    {active && <motion.div layoutId="navDot" className="w-1 h-1 rounded-full bg-cyan-400" />}
  </button>
);

export default WalletDashboard;
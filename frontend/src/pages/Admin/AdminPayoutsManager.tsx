import React, { useState } from 'react';
import {
  CreditCard, DollarSign, Download, CheckCircle2, Search, ArrowUpRight, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminVerificationPayoutApi } from '@/lib/admin-verification-payout-api';

const AdminPayoutsManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedPayout, setSelectedPayout] = useState<any>(null);
  const [transactionReference, setTransactionReference] = useState('');
  const [notes, setNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: pendingPayouts, isLoading: loadingPending } = useQuery({
    queryKey: ['adminPendingPayouts'],
    queryFn: adminVerificationPayoutApi.getPendingPayouts,
  });

  const { data: payoutHistory, isLoading: loadingHistory } = useQuery({
    queryKey: ['adminPayoutHistory'],
    queryFn: adminVerificationPayoutApi.getPayoutHistory,
  });

  const processMutation = useMutation({
    mutationFn: adminVerificationPayoutApi.processPayout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPendingPayouts'] });
      queryClient.invalidateQueries({ queryKey: ['adminPayoutHistory'] });
      setSelectedPayout(null);
      setTransactionReference('');
    },
  });

  const handleProcessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayout || !transactionReference) return;
    processMutation.mutate({
      teacherId: selectedPayout.teacherId,
      amount: selectedPayout.withdrawableBalance,
      transactionReference,
      notes,
    });
  };

  const filteredPending = pendingPayouts?.filter((p: any) =>
    p.teacherName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.vlmTeacherId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manual Weekly Teacher Payouts</h1>
          <p className="text-xs text-zinc-400">Review teacher earnings, access bank details, and record manual UTR payout transfers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-white/10 text-xs gap-2">
            <Download size={14} /> Export CSV Sheet
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Weekly Payout Table */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold flex items-center gap-2 text-cyan-400">
              <DollarSign size={20} /> Eligible Pending Payouts
            </h2>
            <div className="relative w-48">
              <Input
                placeholder="Search teacher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black/40 border-white/10 text-xs text-white pl-8"
              />
              <Search size={14} className="absolute left-2.5 top-2.5 text-zinc-500" />
            </div>
          </div>

          {loadingPending ? (
            <div className="p-8 text-center text-zinc-500"><Loader2 className="animate-spin w-6 h-6 mx-auto" /></div>
          ) : (!filteredPending || filteredPending.length === 0) ? (
            <div className="p-8 text-center bg-white/5 rounded-2xl text-zinc-500 text-xs">
              No pending payouts available right now.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-400 uppercase text-[10px]">
                    <th className="py-3 px-2">Teacher</th>
                    <th className="py-3 px-2">Bank Details</th>
                    <th className="py-3 px-2">Amount Due</th>
                    <th className="py-3 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredPending.map((p: any) => (
                    <tr key={p.teacherId} className="hover:bg-white/5 transition">
                      <td className="py-3 px-2">
                        <div className="font-bold">{p.teacherName}</div>
                        <div className="text-[10px] text-cyan-400 font-mono">{p.vlmTeacherId || 'N/A'}</div>
                      </td>
                      <td className="py-3 px-2">
                        <div>{p.bankDetails?.bankName || 'N/A'}</div>
                        <div className="text-[10px] text-zinc-400 font-mono">A/C: {p.bankDetails?.accountNumber || 'N/A'}</div>
                        <div className="text-[10px] text-zinc-500">IFSC: {p.bankDetails?.ifsc || 'N/A'}</div>
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-emerald-400 font-bold text-sm">₹{p.withdrawableBalance}</span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <Button
                          onClick={() => setSelectedPayout(p)}
                          className="bg-cyan-500 hover:bg-cyan-600 font-semibold text-xs px-3 py-1 rounded-lg"
                        >
                          Mark Paid
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Process Payout Action Modal / Side Panel */}
        <div className="lg:col-span-1">
          {selectedPayout ? (
            <form onSubmit={handleProcessSubmit} className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-emerald-400">
                <CreditCard size={18} /> Record Payout Transfer
              </h3>

              <div className="bg-black/40 border border-white/10 p-3 rounded-xl text-xs space-y-1">
                <p><span className="text-zinc-500">Teacher:</span> <strong className="text-white">{selectedPayout.teacherName}</strong></p>
                <p><span className="text-zinc-500">Amount Due:</span> <strong className="text-emerald-400">₹{selectedPayout.withdrawableBalance}</strong></p>
                <p><span className="text-zinc-500">Bank:</span> {selectedPayout.bankDetails?.bankName} ({selectedPayout.bankDetails?.accountNumber})</p>
              </div>

              <div>
                <label className="text-xs text-zinc-300 font-medium mb-1 block">Bank UTR / Transaction Ref No.</label>
                <Input
                  placeholder="e.g. UTR123987456"
                  value={transactionReference}
                  onChange={(e) => setTransactionReference(e.target.value)}
                  className="bg-black/40 border-white/10 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-zinc-300 font-medium mb-1 block">Notes (Optional)</label>
                <Input
                  placeholder="e.g. Weekly Payout for July 21"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-black/40 border-white/10 text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setSelectedPayout(null)} className="border-white/10 text-zinc-400">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={processMutation.isPending}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 font-bold gap-2 text-white"
                >
                  {processMutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : <><CheckCircle2 size={16} /> Submit Payment</>}
                </Button>
              </div>
            </form>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-center text-zinc-500 text-xs">
              Select a teacher from the table to input the UTR number and record manual bank payout.
            </div>
          )}

          {/* Recent Completed Payouts */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mt-6 space-y-3">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Recent Payout History</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {payoutHistory?.slice(0, 5).map((rec: any) => (
                <div key={rec._id} className="p-2.5 bg-black/40 border border-white/10 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <div className="font-semibold">{rec.teacherId?.firstName} {rec.teacherId?.lastName}</div>
                    <div className="text-[10px] text-zinc-500 font-mono">Ref: {rec.transactionReference}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-emerald-400 font-bold">₹{rec.amount}</div>
                    <div className="text-[10px] text-zinc-500">{new Date(rec.paidAt).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPayoutsManager;

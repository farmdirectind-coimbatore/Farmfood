'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Download, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { formatINR } from '@/lib/utils/currency';

interface Payout {
  id: string;
  holding_id: string;
  payout_date: string;
  amount: number;
  running_total: number;
  weekdays_paid: number;
  marked_at: string | null;
  holding: {
    lots: number;
    amount_invested: number;
  } | null;
}

interface PayoutsResponse {
  payouts: Payout[];
  summary: {
    totalPayouts: number;
    totalAmount: number;
    thisMonthAmount: number;
    thisYearAmount: number;
  };
}

async function fetchPayouts(): Promise<PayoutsResponse> {
  const res = await fetch('/api/dashboard/payouts');
  if (!res.ok) throw new Error('Failed to fetch payouts');
  return res.json();
}

export default function PayoutsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['payouts'],
    queryFn: fetchPayouts,
  });

  const [dateRange, setDateRange] = useState<'all' | 'month' | 'year'>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="bg-white rounded-xl p-4 border border-[#d8f3dc] animate-pulse">
            <div className="h-4 bg-[#d8f3dc] rounded w-1/2 mb-2" />
            <div className="h-4 bg-[#d8f3dc] rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-[#fecaca]">
        <p className="text-[#dc2626]">Failed to load payout history.</p>
      </div>
    );
  }

  const { payouts, summary } = data;

  const now = new Date();
  const filteredPayouts = payouts.filter(payout => {
    const payoutDate = new Date(payout.payout_date);
    if (dateRange === 'month') {
      return payoutDate.getMonth() === now.getMonth() && payoutDate.getFullYear() === now.getFullYear();
    }
    if (dateRange === 'year') {
      return payoutDate.getFullYear() === now.getFullYear();
    }
    return true;
  });

  const sortedPayouts = [...filteredPayouts].sort((a, b) => {
    const dateA = new Date(a.payout_date).getTime();
    const dateB = new Date(b.payout_date).getTime();
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#1a2e1a]">Payout History</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard label="Total Payouts" value={formatINR(summary.totalAmount)} icon={Download} color="bg-[#dcfce7] text-[#166534]" />
        <SummaryCard label="This Month" value={formatINR(summary.thisMonthAmount)} icon={Calendar} color="bg-[#fef3c7] text-[#92400e]" />
        <SummaryCard label="This Year" value={formatINR(summary.thisYearAmount)} icon={Calendar} color="bg-[#dbeafe] text-[#1d4ed8]" />
        <SummaryCard label="Transactions" value={String(summary.totalPayouts)} icon={Calendar} color="bg-[#d8f3dc] text-[#2d6a4f]" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-[#d8f3dc] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-sm text-[#52796f]">Filter:</span>
          <div className="flex gap-2">
            {(['all', 'month', 'year'] as const).map(range => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  dateRange === range
                    ? 'bg-[#2d6a4f] text-white'
                    : 'bg-[#f0f7f0] text-[#52796f] hover:bg-[#d8f3dc]'
                }`}
              >
                {range === 'all' ? 'All Time' : range === 'month' ? 'This Month' : 'This Year'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#52796f]">Sort:</span>
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-1 px-4 py-2 bg-[#f0f7f0] text-[#52796f] rounded-xl text-sm font-medium hover:bg-[#d8f3dc] transition-colors"
          >
            {sortOrder === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
          </button>
        </div>
      </div>

      {/* Payouts Table */}
      {sortedPayouts.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-[#d8f3dc]">
          <Calendar className="w-16 h-16 text-[#95d5b2] mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[#1a2e1a] mb-2">No Payouts Found</h3>
          <p className="text-[#52796f]">No payouts match your current filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#d8f3dc] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f0f7f0]">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#52796f]">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#52796f]">Holding</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-[#52796f]">Amount</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-[#52796f]">Running Total</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[#52796f]">Weekday #</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[#52796f]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d8f3dc]">
                {sortedPayouts.map((payout) => {
                  const holding = payout.holding;
                  return (
                    <tr key={payout.id} className="hover:bg-[#fafdf7] transition-colors">
                      <td className="px-4 py-3 text-sm text-[#1a2e1a]">
                        {format(new Date(payout.payout_date), 'dd MMM yyyy')}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#1a2e1a]">
                        <div className="font-medium">
                          {holding ? `${holding.lots} Lot${holding.lots > 1 ? 's' : ''}` : '—'}
                        </div>
                        <div className="text-xs text-[#52796f]">
                          {holding ? `${formatINR(holding.amount_invested)} invested` : ''}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-[#2d6a4f]">
                        +{formatINR(payout.amount)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-[#52796f]">
                        {formatINR(payout.running_total)}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-[#52796f]">
                        #{payout.weekdays_paid}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {payout.marked_at ? (
                          <span className="inline-block px-2.5 py-1 bg-[#dcfce7] text-[#166534] text-xs font-semibold rounded-full">
                            Paid
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-1 bg-[#fef3c7] text-[#92400e] text-xs font-semibold rounded-full">
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon, color }: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-[#d8f3dc]">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-xs text-[#52796f] mb-1">{label}</p>
      <p className="text-xl font-bold text-[#1a2e1a]">{value}</p>
    </div>
  );
}
'use client';

import { useQuery } from '@tanstack/react-query';
import { Wallet, Package, TrendingUp, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { formatINR, formatNumber } from '@/lib/utils/currency';
import { APP_CONSTANTS } from '@/lib/constants';

interface Holding {
  id: string;
  lots: number;
  amount_invested: number;
  daily_payout: number;
  total_projected_return: number;
  total_paid: number;
  start_date: string;
  end_date: string;
  weekdays_paid: number;
  status: string;
  progress: {
    weekdaysPaid: number;
    amountReceived: number;
    amountRemaining: number;
    daysLeft: number;
    isComplete: boolean;
    progressPercent: number;
  };
}

async function fetchHoldings(): Promise<Holding[]> {
  const res = await fetch('/api/dashboard/holdings');
  if (!res.ok) throw new Error('Failed to load portfolio');
  return res.json();
}

export default function PortfolioPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['portfolio'],
    queryFn: fetchHoldings,
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-[#d8f3dc]">
        <Loader2 className="w-10 h-10 text-[#2d6a4f] animate-spin mx-auto mb-4" />
        <p className="text-[#52796f]">Loading your portfolio...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-[#fecaca]">
        <p className="text-[#dc2626]">Failed to load portfolio.</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center border border-[#d8f3dc]">
        <Wallet className="w-16 h-16 text-[#95d5b2] mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-[#1a2e1a] mb-2">No Holdings Yet</h2>
        <p className="text-[#52796f] mb-6">Buy your first lot to start earning daily returns.</p>
        <Link
          href="/dashboard/buy-lots"
          className="inline-flex items-center gap-2 bg-[#2d6a4f] text-white font-semibold py-3 px-6 rounded-2xl hover:bg-[#1a4d3a] transition-colors"
        >
          <Package className="w-5 h-5" />
          Buy Lots
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-[#1a2e1a]">My Portfolio</h1>
        <Link
          href="/dashboard/buy-lots"
          className="flex items-center gap-2 bg-[#2d6a4f] text-white text-sm font-semibold py-2 px-4 rounded-xl hover:bg-[#1a4d3a] transition-colors"
        >
          <Package className="w-4 h-4" />
          Buy More Lots
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {data.map(holding => (
          <div key={holding.id} className="bg-white rounded-2xl border border-[#d8f3dc] overflow-hidden">
            <div className="p-6 border-b border-[#d8f3dc] bg-gradient-to-br from-[#2d6a4f] to-[#1a4d3a]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#95d5b2] text-sm">Holding {holding.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {holding.lots} Lot{holding.lots > 1 ? 's' : ''}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  holding.status === 'COMPLETED' ? 'bg-white/20 text-white' : 'bg-[#95d5b2] text-[#1a2e1a]'
                }`}>
                  {holding.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div>
                  <p className="text-[#95d5b2] text-xs">Total Invested</p>
                  <p className="text-white font-bold">{formatINR(holding.amount_invested)}</p>
                </div>
                <div>
                  <p className="text-[#95d5b2] text-xs">Total Projected Return</p>
                  <p className="text-white font-bold">{formatINR(holding.total_projected_return)}</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[#52796f]">Progress</span>
                <span className="font-semibold text-[#2d6a4f]">{Math.round(holding.progress.progressPercent)}%</span>
              </div>
              <div className="h-3 bg-[#d8f3dc] rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-[#2d6a4f] rounded-full transition-all"
                  style={{ width: `${Math.min(holding.progress.progressPercent, 100)}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Info label="Daily Payout" value={formatINR(holding.daily_payout)} icon={TrendingUp} />
                <Info label="Received So Far" value={formatINR(holding.progress.amountReceived)} icon={Wallet} />
                <Info label="Remaining Returns" value={formatINR(holding.progress.amountRemaining)} icon={TrendingUp} />
                <Info label="Weekdays Paid" value={`${holding.progress.weekdaysPaid}/${APP_CONSTANTS.TOTAL_WEEKDAYS}`} icon={Wallet} />
              </div>

              <div className="mt-4 pt-4 border-t border-[#d8f3dc] flex justify-between text-xs text-[#52796f]">
                <span>Started: {format(new Date(holding.start_date), 'dd MMM yyyy')}</span>
                <span>Ends: {format(new Date(holding.end_date), 'dd MMM yyyy')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Info({ label, value, icon: Icon }: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="bg-[#fafdf7] rounded-xl p-3">
      <div className="flex items-center gap-2 text-[#52796f] mb-1">
        <Icon className="w-4 h-4 text-[#2d6a4f]" />
        <span className="text-xs">{label}</span>
      </div>
      <p className="font-semibold text-[#1a2e1a] text-sm">{value}</p>
    </div>
  );
}
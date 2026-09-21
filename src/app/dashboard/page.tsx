'use client';

import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Wallet, ArrowDownCircle, PlusCircle, IndianRupee, Clock, XCircle } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { formatINR, formatNumber } from '@/lib/utils/currency';

interface DashboardStats {
  totalLots: number;
  totalInvested: number;
  dailyPayoutRate: number;
  weekdaysPaid: number;
  totalReceived: number;
  projectedRemaining: number;
  holdings: Holding[];
  latestPurchase: {
    id: string;
    lots: number;
    amount: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    rejection_reason: string | null;
    created_at: string;
  } | null;
  onboardingComplete: boolean;
}

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
  progress_percent: number;
  is_complete: boolean;
}

async function fetchStats(): Promise<DashboardStats> {
  const res = await fetch('/api/dashboard/stats');
  if (!res.ok) throw new Error('Failed to load dashboard');
  return res.json();
}

export default function DashboardHome() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchStats,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-2xl p-6 border border-[#d8f3dc] animate-pulse">
          <div className="h-6 bg-[#d8f3dc] rounded w-1/4 mb-4" />
          <div className="h-4 bg-[#d8f3dc] rounded w-1/2" />
        </div>
        {[1, 2, 3, 4].map(i => (
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
        <p className="text-[#dc2626]">Failed to load dashboard. Please try again.</p>
      </div>
    );
  }

  const hasHoldings = data.holdings.length > 0;
  const latestPurchase = data.latestPurchase;

  // Gate 1: holdings exist → show full dashboard
  if (hasHoldings) {
    return <HoldingsDashboard data={data} />;
  }

  // Gate 2: pending purchase → awaiting review
  if (latestPurchase?.status === 'PENDING') {
    return <PendingReviewCard purchase={latestPurchase} />;
  }

  // Gate 3: rejected purchase → show rejection + retry
  if (latestPurchase?.status === 'REJECTED') {
    return <RejectedCard purchase={latestPurchase} />;
  }

  // Gate 4: no holdings, no pending, no setup → complete profile
  if (!data.onboardingComplete) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-[#2d6a4f] to-[#1a4d3a] rounded-3xl p-10 text-white text-center">
          <Wallet className="w-16 h-16 mx-auto mb-4 text-[#95d5b2]" />
          <h1 className="text-3xl font-bold mb-3">Welcome to FarmDirect</h1>
          <p className="text-white/80 max-w-md mx-auto mb-8">
            Let us get your account set up before you invest. We just need your name and phone number.
          </p>
          <Link
            href="/welcome"
            className="inline-flex items-center gap-2 bg-white text-[#2d6a4f] font-semibold py-3 px-8 rounded-2xl hover:shadow-lg transition-shadow"
          >
            Complete Setup
            <PlusCircle className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  // Gate 5: setup done but not purchased yet
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-[#2d6a4f] to-[#1a4d3a] rounded-3xl p-10 text-white text-center">
        <Wallet className="w-16 h-16 mx-auto mb-4 text-[#95d5b2]" />
        <h1 className="text-3xl font-bold mb-3">You are ready to invest</h1>
        <p className="text-white/80 max-w-md mx-auto mb-8">
          Buy your first lot and start earning 1% daily on weekdays. Each lot costs ₹10,000.
        </p>
        <Link
          href="/dashboard/buy-lots"
          className="inline-flex items-center gap-2 bg-white text-[#2d6a4f] font-semibold py-3 px-8 rounded-2xl hover:shadow-lg transition-shadow"
        >
          <PlusCircle className="w-5 h-5" />
          Buy Your First Lot
        </Link>
      </div>
    </div>
  );
}

/* ─── Full Dashboard (approved holdings) ────────────────────────── */

function HoldingsDashboard({ data }: { data: DashboardStats }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Invested" value={formatINR(data.totalInvested)} icon={Wallet} color="bg-[#d8f3dc] text-[#2d6a4f]" />
        <StatCard label="Total Received" value={formatINR(data.totalReceived)} icon={TrendingUp} color="bg-[#dcfce7] text-[#166534]" />
        <StatCard label="Projected Remaining" value={formatINR(data.projectedRemaining)} icon={ArrowDownCircle} color="bg-[#fef3c7] text-[#92400e]" />
        <StatCard label="Daily Payout" value={formatINR(data.dailyPayoutRate)} icon={IndianRupee} color="bg-[#dbeafe] text-[#1d4ed8]" />
      </div>

      <div className="bg-white rounded-2xl p-6 border border-[#d8f3dc]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#1a2e1a]">Your Holdings</h2>
          <Link href="/dashboard/buy-lots" className="flex items-center gap-1 text-sm text-[#2d6a4f] font-semibold hover:underline">
            <PlusCircle className="w-4 h-4" />
            Buy More
          </Link>
        </div>
        <div className="space-y-4">
          {data.holdings.map(holding => (
            <div key={holding.id} className="bg-[#fafdf7] rounded-2xl p-4 border border-[#d8f3dc]">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div>
                  <p className="font-semibold text-[#1a2e1a]">
                    {formatNumber(holding.lots)} Lot{holding.lots > 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-[#52796f] mt-1">
                    {format(new Date(holding.start_date), 'dd MMM yyyy')} → {format(new Date(holding.end_date), 'dd MMM yyyy')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#2d6a4f]">{formatINR(holding.total_paid)}</p>
                  <p className="text-xs text-[#52796f]">received</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-[#d8f3dc] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#2d6a4f] rounded-full transition-all"
                    style={{ width: `${Math.min(holding.progress_percent, 100)}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-[#52796f] whitespace-nowrap">
                  {holding.weekdays_paid}/249
                </span>
              </div>
              <div className="flex justify-between mt-2 text-xs text-[#52796f]">
                <span>{Math.round(holding.progress_percent)}% complete</span>
                <span>Daily: {formatINR(holding.daily_payout)}</span>
                <span>Total: {formatINR(holding.total_projected_return)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Pending Review Card ──────────────────────────────────────── */

function PendingReviewCard({ purchase }: { purchase: { lots: number; amount: number; created_at: string } }) {
  return (
    <div className="bg-white rounded-2xl p-8 border border-[#fde68a] text-center max-w-lg mx-auto">
      <div className="w-16 h-16 bg-[#fef3c7] rounded-full flex items-center justify-center mx-auto mb-5">
        <Clock className="w-8 h-8 text-[#92400e]" />
      </div>
      <h2 className="text-2xl font-bold text-[#1a2e1a] mb-3">Payment Under Review</h2>
      <p className="text-[#52796f] text-sm mb-6 max-w-sm mx-auto">
        Your payment for {purchase.lots} lot{purchase.lots > 1 ? 's' : ''} ({formatINR(purchase.amount)}) submitted on{' '}
        {format(new Date(purchase.created_at), 'dd MMM yyyy')} is being verified by our team.
      </p>
      <div className="bg-[#f0f7f0] rounded-xl p-4 text-sm text-[#52796f] text-left mb-6">
        <p className="font-semibold text-[#1a2e1a] mb-1">What happens next?</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>Verification typically completes within 24 hours</li>
          <li>You will receive an email once approved</li>
          <li>After approval, daily payouts begin on the next weekday</li>
        </ul>
      </div>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-[#2d6a4f] text-white font-semibold py-3 px-6 rounded-2xl hover:bg-[#1a4d3a] transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}

/* ─── Rejected Card ────────────────────────────────────────────── */

function RejectedCard({ purchase }: { purchase: { lots: number; amount: number; rejection_reason: string | null; created_at: string } }) {
  return (
    <div className="bg-white rounded-2xl p-8 border border-[#fecaca] text-center max-w-lg mx-auto">
      <div className="w-16 h-16 bg-[#fef2f2] rounded-full flex items-center justify-center mx-auto mb-5">
        <XCircle className="w-8 h-8 text-[#dc2626]" />
      </div>
      <h2 className="text-2xl font-bold text-[#1a2e1a] mb-3">Payment Not Verified</h2>
      <p className="text-[#52796f] text-sm mb-4 max-w-sm mx-auto">
        Your payment for {purchase.lots} lot{purchase.lots > 1 ? 's' : ''} ({formatINR(purchase.amount)}) could not be verified.
      </p>
      {purchase.rejection_reason && (
        <div className="bg-[#fef2f2] rounded-xl p-4 text-sm text-[#991b1b] text-left mb-6 border border-[#fecaca]">
          <p className="font-semibold mb-1">Reason:</p>
          <p>{purchase.rejection_reason}</p>
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/dashboard/buy-lots"
          className="inline-flex items-center justify-center gap-2 bg-[#2d6a4f] text-white font-semibold py-3 px-6 rounded-2xl hover:bg-[#1a4d3a] transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
          Buy Lots Again
        </Link>
        <a
          href="mailto:farmdirect.ind@gmail.com"
          className="inline-flex items-center justify-center gap-2 bg-white text-[#52796f] font-semibold py-3 px-6 rounded-2xl border border-[#d8f3dc] hover:bg-[#f0f7f0] transition-colors"
        >
          Contact Support
        </a>
      </div>
    </div>
  );
}

/* ─── Stat Card ────────────────────────────────────────────────── */

function StatCard({ label, value, icon: Icon, color }: {
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
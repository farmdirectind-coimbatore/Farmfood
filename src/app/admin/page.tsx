'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Package,
  IndianRupee,
  FileClock,
  CalendarCheck,
  CalendarClock,
  AlertTriangle,
  Loader2,
  TrendingUp,
  Wallet,
  ArrowDownToLine,
  Hourglass,
  ChevronRight,
  BadgeCheck,
} from 'lucide-react';
import Link from 'next/link';
import { formatINR } from '@/lib/utils/currency';

interface UserStat {
  userId: string;
  email: string;
  name: string | null;
  createdAt: string;
  totalLots: number;
  totalInvested: number;
  totalReceived: number;
  pendingAmount: number;
  totalProjected: number;
  holdingsCount: number;
  activeHoldings: number;
  completedHoldings: number;
  pendingRequests: number;
}

interface AdminStats {
  totalUsers: number;
  verifiedUsers: number;
  totalLots: number;
  totalInvested: number;
  totalPaidOut: number;
  totalPendingPayout: number;
  totalProjectedReturn: number;
  pendingRequests: number;
  todaysPayouts: number;
  paidToday: number;
  pendingToday: number;
  completingSoon: number;
  userStats: UserStat[];
}

async function fetchStats(): Promise<AdminStats> {
  const res = await fetch('/api/admin/stats');
  if (!res.ok) throw new Error('Failed to load stats');
  return res.json();
}

export default function AdminOverview() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['adminStats'],
    queryFn: fetchStats,
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center border border-[#d8f3dc]">
        <Loader2 className="w-10 h-10 text-[#2d6a4f] animate-spin mx-auto mb-4" />
        <p className="text-[#52796f]">Loading admin overview...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center border border-[#fecaca]">
        <p className="text-[#dc2626]">Failed to load admin overview.</p>
      </div>
    );
  }

  const payoutProgress = data.todaysPayouts ? (data.paidToday / data.todaysPayouts) * 100 : 0;
  const topInvestors = data.userStats.slice(0, 6);
  const netReturnedToDate = data.totalPaidOut;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2e1a]">Admin Overview</h1>
          <p className="text-sm text-[#52796f] mt-1">Complete financial overview of your investment platform.</p>
        </div>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#2d6a4f] text-white text-sm font-semibold rounded-xl hover:bg-[#1a4d3a] transition-colors"
        >
          <Users className="w-4 h-4" />
          Manage Users
        </Link>
      </div>

      {/* People & holdings */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Users"
          value={String(data.totalUsers)}
          sub={`${data.verifiedUsers} investors`}
          icon={Users}
          color="bg-[#dbeafe] text-[#1d4ed8]"
          href="/admin/users"
        />
        <StatCard
          label="Total Lots"
          value={String(data.totalLots)}
          sub="across all holdings"
          icon={Package}
          color="bg-[#dcfce7] text-[#166534]"
          href="/admin/users"
        />
        <StatCard
          label="Pending Requests"
          value={String(data.pendingRequests)}
          sub="awaiting verification"
          icon={FileClock}
          color="bg-[#fef3c7] text-[#92400e]"
          href="/admin/verification"
        />
        <StatCard
          label="Completing Soon"
          value={String(data.completingSoon)}
          sub="≤10 weekdays left"
          icon={TrendingUp}
          color="bg-[#fff7ed] text-[#c2410c]"
        />
      </div>

      {/* Financial overview */}
      <div className="bg-white rounded-2xl p-6 border border-[#d8f3dc]">
        <h2 className="text-lg font-bold text-[#1a2e1a] flex items-center gap-2 mb-4">
          <Wallet className="w-5 h-5 text-[#2d6a4f]" />
          Financial Overview
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MoneyCard
            label="Total Invested"
            value={formatINR(data.totalInvested)}
            sub="lifetime investments"
            icon={IndianRupee}
            color="bg-[#d8f3dc] text-[#2d6a4f]"
          />
          <MoneyCard
            label="Projected Returns"
            value={formatINR(data.totalProjectedReturn)}
            sub="if all cycles complete"
            icon={TrendingUp}
            color="bg-[#dbeafe] text-[#1d4ed8]"
          />
          <MoneyCard
            label="Already Paid Out"
            value={formatINR(netReturnedToDate)}
            sub={`${data.totalLots ? Math.round((netReturnedToDate / data.totalInvested) * 100) : 0}% of invested`}
            icon={ArrowDownToLine}
            color="bg-[#dcfce7] text-[#166534]"
          />
          <MoneyCard
            label="Pending Payouts"
            value={formatINR(data.totalPendingPayout)}
            sub="generated, awaiting payment"
            icon={Hourglass}
            color="bg-[#fef3c7] text-[#92400e]"
          />
        </div>
        {data.totalInvested > 0 && (
          <div className="mt-4 bg-[#fafdf7] border border-[#d8f3dc] rounded-xl p-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[#52796f]">Funds returned to investors</span>
              <span className="font-semibold text-[#166534]">{Math.round((netReturnedToDate / data.totalInvested) * 100)}%</span>
            </div>
            <div className="h-3 bg-[#d8f3dc] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2d6a4f] rounded-full transition-all"
                style={{ width: `${Math.min(100, (netReturnedToDate / data.totalInvested) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Verification */}
        <div className="bg-white rounded-2xl p-6 border border-[#d8f3dc]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#1a2e1a] flex items-center gap-2">
              <FileClock className="w-5 h-5 text-[#2d6a4f]" />
              Pending Verification
            </h2>
            <Link href="/admin/verification" className="text-sm text-[#2d6a4f] font-semibold hover:underline">
              View all →
            </Link>
          </div>
          <p className="text-4xl font-bold text-[#1a2e1a]">{data.pendingRequests}</p>
          <p className="text-sm text-[#52796f] mt-1">Purchase requests awaiting admin review</p>
          <Link
            href="/admin/verification"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#2d6a4f] text-white text-sm font-semibold rounded-xl hover:bg-[#1a4d3a] transition-colors"
          >
            Review Requests
          </Link>
        </div>

        {/* Today's Payouts */}
        <div className="bg-white rounded-2xl p-6 border border-[#d8f3dc]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#1a2e1a] flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-[#2d6a4f]" />
              Today&apos;s Payouts
            </h2>
            <Link href="/admin/payouts" className="text-sm text-[#2d6a4f] font-semibold hover:underline">
              Open console →
            </Link>
          </div>
          {data.todaysPayouts === 0 ? (
            <p className="text-sm text-[#52796f]">No payouts due today.</p>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#52796f]">Paid</span>
                    <span className="font-semibold text-[#166534]">{data.paidToday} / {data.todaysPayouts}</span>
                  </div>
                  <div className="h-3 bg-[#d8f3dc] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#2d6a4f] rounded-full transition-all"
                      style={{ width: `${payoutProgress}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1 text-[#52796f]">
                  <BadgeCheck className="w-4 h-4 text-[#166534]" />
                  Paid: <strong className="text-[#166534]">{data.paidToday}</strong>
                </span>
                <span className="flex items-center gap-1 text-[#52796f]">
                  <CalendarClock className="w-4 h-4 text-[#92400e]" />
                  Pending: <strong className="text-[#92400e]">{data.pendingToday}</strong>
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recent investors */}
      <div className="bg-white rounded-2xl border border-[#d8f3dc] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 bg-[#f0f7f0] border-b border-[#d8f3dc]">
          <h2 className="font-bold text-[#1a2e1a] text-base flex items-center gap-2">
            <Users className="w-5 h-5 text-[#2d6a4f]" />
            Top Investors
          </h2>
          <Link href="/admin/users" className="text-sm text-[#2d6a4f] font-semibold hover:underline">
            View all →
          </Link>
        </div>
        {topInvestors.length === 0 ? (
          <p className="p-6 text-center text-sm text-[#52796f]">No investors yet.</p>
        ) : (
          <div className="divide-y divide-[#d8f3dc]">
            {topInvestors.map(user => (
              <Link
                key={user.userId}
                href={`/admin/users/${user.userId}`}
                className="flex items-center justify-between flex-wrap gap-3 px-5 py-3 hover:bg-[#fafdf7] transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#d8f3dc] flex items-center justify-center text-[#2d6a4f] font-bold text-sm flex-shrink-0">
                    {user.name?.[0]?.toUpperCase() ?? user.email[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-[#1a2e1a] truncate">{user.name || user.email}</p>
                    <p className="text-xs text-[#52796f]">
                      {user.totalLots} lot{user.totalLots === 1 ? '' : 's'} · {user.activeHoldings} active
                      {user.pendingRequests > 0 ? ` · ${user.pendingRequests} pending request${user.pendingRequests === 1 ? '' : 's'}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-right">
                    <p className="font-semibold text-[#1a2e1a]">{formatINR(user.totalInvested)}</p>
                    <p className="text-xs text-[#95d5b2]">invested</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#166534]">{formatINR(user.totalReceived)}</p>
                    <p className="text-xs text-[#95d5b2]">received</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#92400e]">{formatINR(user.pendingAmount)}</p>
                    <p className="text-xs text-[#95d5b2]">pending</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#95d5b2] group-hover:text-[#2d6a4f] transition-colors flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <QuickAction
          href="/admin/verification"
          title="Verify Payments"
          description="Approve or reject purchase requests"
          icon={FileClock}
        />
        <QuickAction
          href="/admin/payouts"
          title="Daily Payout Console"
          description="Mark today's payouts as paid"
          icon={CalendarCheck}
        />
        <QuickAction
          href="/admin/bank-details"
          title="Bank Details"
          description="Update displayed bank account info"
          icon={IndianRupee}
        />
      </div>

      {data.pendingToday > 0 && (
        <div className="flex items-center gap-3 bg-[#fff8f0] border border-[#fde68a] rounded-2xl p-4">
          <AlertTriangle className="w-5 h-5 text-[#92400e] flex-shrink-0" />
          <p className="text-sm text-[#92400e]">
            {data.pendingToday} payout{data.pendingToday > 1 ? 's' : ''} pending today. Use the payout console to process them.
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon, color, href }: {
  label: string;
  value: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  href?: string;
}) {
  const content = (
    <div className="bg-white rounded-2xl p-5 border border-[#d8f3dc] hover:shadow-md transition-shadow h-full">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-xs text-[#52796f] mb-1">{label}</p>
      <p className="text-2xl font-bold text-[#1a2e1a]">{value}</p>
      {sub && <p className="text-xs text-[#95d5b2] mt-1">{sub}</p>}
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

function MoneyCard({ label, value, sub, icon: Icon, color }: {
  label: string;
  value: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className="bg-[#fafdf7] rounded-xl p-4 border border-[#d8f3dc]">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-xs text-[#52796f] mb-1">{label}</p>
      <p className="text-lg font-bold text-[#1a2e1a]">{value}</p>
      <p className="text-xs text-[#95d5b2] mt-1">{sub}</p>
    </div>
  );
}

function QuickAction({ href, title, description, icon: Icon }: {
  href: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link href={href} className="bg-white rounded-2xl p-5 border border-[#d8f3dc] hover:shadow-md transition-shadow group">
      <div className="w-10 h-10 rounded-xl bg-[#d8f3dc] flex items-center justify-center mb-3 group-hover:bg-[#2d6a4f] transition-colors">
        <Icon className="w-5 h-5 text-[#2d6a4f] group-hover:text-white transition-colors" />
      </div>
      <p className="font-semibold text-[#1a2e1a]">{title}</p>
      <p className="text-sm text-[#52796f] mt-1">{description}</p>
    </Link>
  );
}
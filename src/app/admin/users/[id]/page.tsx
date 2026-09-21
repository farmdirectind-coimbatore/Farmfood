'use client';

import { useState, Fragment } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Loader2, Users, Phone, Landmark, BadgeInfo, Calendar, IndianRupee, TrendingUp, XCircle, FileText } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { formatINR } from '@/lib/utils/currency';

interface AdminUserDetails {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    created_at: string;
    avatar_url: string | null;
  };
  profile: {
    phone: string | null;
    account_holder_name: string | null;
    account_number: string | null;
    ifsc_code: string | null;
    upi_id: string | null;
  } | null;
  holdings: Array<{
    id: string;
    lots: number;
    amount_invested: number;
    daily_payout: number;
    total_projected_return: number;
    start_date: string;
    end_date: string;
    weekdays_paid: number;
    total_paid: number;
    status: string;
    progress_percent: number;
    is_complete: boolean;
    payouts: Array<{
      id: string;
      payout_date: string;
      amount: number;
      running_total: number;
      weekdays_paid: number;
      marked_by: string | null;
      marked_at: string | null;
    }>;
  }>;
  purchaseRequests: Array<{
    id: string;
    lots: number;
    amount: number;
    daily_payout: number;
    total_projected_return: number;
    screenshot_url: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    rejection_reason: string | null;
    reviewed_by: string | null;
    reviewed_at: string | null;
    created_at: string;
  }>;
  summary: {
    totalLots: number;
    totalInvested: number;
    totalReceived: number;
    pendingPayouts: number;
    totalHoldings: number;
  };
}

async function fetchUserDetails(userId: string): Promise<AdminUserDetails> {
  const res = await fetch(`/api/admin/users/${userId}/details`);
  if (!res.ok) throw new Error('Failed to load user details');
  return res.json();
}

export default function AdminUserDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [expandedHolding, setExpandedHolding] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['adminUserDetails', id],
    queryFn: () => fetchUserDetails(id),
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center border border-[#d8f3dc]">
        <Loader2 className="w-10 h-10 text-[#2d6a4f] animate-spin mx-auto mb-4" />
        <p className="text-[#52796f]">Loading user details...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center border border-[#fecaca]">
        <p className="text-[#dc2626]">Failed to load user details.</p>
      </div>
    );
  }

  const { user, profile, holdings, purchaseRequests, summary } = data;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-2 px-4 py-2 bg-[#f0f7f0] text-[#2d6a4f] rounded-xl font-medium hover:bg-[#d8f3dc] transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Users
      </Link>

      {/* User Header */}
      <div className="bg-white rounded-2xl p-6 border border-[#d8f3dc]">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-[#d8f3dc] flex items-center justify-center flex-shrink-0 overflow-hidden relative">
            {user.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt={user.name || 'User'}
                fill
                className="object-cover rounded-2xl"
                sizes="80px"
              />
            ) : (
              <span className="text-2xl font-bold text-[#2d6a4f]">
                {user.name?.[0]?.toUpperCase() ?? 'U'}
              </span>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-[#1a2e1a]">{user.name || '—'}</h1>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                user.role === 'ADMIN' ? 'bg-[#dbeafe] text-[#1d4ed8]' : 'bg-[#dcfce7] text-[#166534]'
              }`}>
                {user.role}
              </span>
            </div>
            <p className="text-[#52796f]">{user.email}</p>
            <p className="text-sm text-[#95d5b2] mt-1">
              Joined {format(new Date(user.created_at), 'dd MMM yyyy')}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <SummaryCard label="Total Lots" value={String(summary.totalLots)} icon={Users} color="bg-[#dbeafe] text-[#1d4ed8]" />
        <SummaryCard label="Total Invested" value={formatINR(summary.totalInvested)} icon={IndianRupee} color="bg-[#d8f3dc] text-[#2d6a4f]" />
        <SummaryCard label="Total Received" value={formatINR(summary.totalReceived)} icon={TrendingUp} color="bg-[#dcfce7] text-[#166534]" />
        <SummaryCard label="Pending Payouts" value={formatINR(summary.pendingPayouts)} icon={Calendar} color="bg-[#fef3c7] text-[#92400e]" />
        <SummaryCard label="Active Holdings" value={String(summary.totalHoldings)} icon={TrendingUp} color="bg-[#fff7ed] text-[#c2410c]" />
      </div>

      {/* Profile & Bank Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-[#d8f3dc]">
          <h2 className="text-lg font-bold text-[#1a2e1a] mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5 text-[#2d6a4f]" />
            Profile Information
          </h2>
          <div className="space-y-3">
            <DetailRow label="Phone" value={profile?.phone || 'Not set'} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#d8f3dc]">
          <h2 className="text-lg font-bold text-[#1a2e1a] mb-4 flex items-center gap-2">
            <Landmark className="w-5 h-5 text-[#2d6a4f]" />
            Payout Bank Details
          </h2>
          <div className="space-y-3">
            <DetailRow label="Account Holder" value={profile?.account_holder_name || 'Not set'} />
            <DetailRow label="Account Number" value={maskAccountNumber(profile?.account_number)} />
            <DetailRow label="IFSC Code" value={profile?.ifsc_code || 'Not set'} />
            <DetailRow label="UPI ID" value={profile?.upi_id || 'Not set'} />
          </div>
        </div>
      </div>

      {/* Purchase Requests */}
      {purchaseRequests.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#d8f3dc]">
          <div className="px-5 py-4 bg-[#f0f7f0] border-b border-[#d8f3dc]">
            <h2 className="font-bold text-[#1a2e1a] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#2d6a4f]" />
              Purchase Requests
            </h2>
          </div>
          <div className="divide-y divide-[#d8f3dc]">
            {purchaseRequests.map(request => (
              <div key={request.id} className="px-5 py-4 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#d8f3dc] flex items-center justify-center text-[#2d6a4f] font-bold">
                    {request.lots}
                  </div>
                  <div>
                    <p className="font-medium text-[#1a2e1a]">{request.lots} Lot{request.lots > 1 ? 's' : ''}</p>
                    <p className="text-sm text-[#52796f]">{formatINR(request.amount)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={request.status} />
                  <span className="text-xs text-[#95d5b2]">{format(new Date(request.created_at), 'dd MMM yyyy, h:mm a')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Holdings */}
      <div className="bg-white rounded-2xl border border-[#d8f3dc]">
        <div className="px-5 py-4 bg-[#f0f7f0] border-b border-[#d8f3dc]">
          <h2 className="font-bold text-[#1a2e1a] flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#2d6a4f]" />
            Holdings ({holdings.length})
          </h2>
        </div>
        {holdings.length === 0 ? (
          <div className="p-10 text-center">
            <TrendingUp className="w-16 h-16 text-[#95d5b2] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#1a2e1a] mb-2">No Holdings</h3>
            <p className="text-[#52796f]">This user has no active or completed holdings.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#d8f3dc]">
            {holdings.map(holding => (
              <div key={holding.id}>
                <button
                  onClick={() => setExpandedHolding(expandedHolding === holding.id ? null : holding.id)}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-[#fafdf7] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#d8f3dc] flex items-center justify-center text-[#2d6a4f] font-bold text-lg">
                      {holding.lots}
                    </div>
                    <div>
                      <p className="font-medium text-[#1a2e1a]">
                        {holding.lots} Lot{holding.lots > 1 ? 's' : ''} · {formatINR(holding.amount_invested)}
                      </p>
                      <p className="text-sm text-[#52796f]">
                        {format(new Date(holding.start_date), 'dd MMM yyyy')} → {format(new Date(holding.end_date), 'dd MMM yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-[#2d6a4f]">{formatINR(holding.total_paid)} / {formatINR(holding.total_projected_return)}</p>
                      <p className="text-xs text-[#52796f]">{holding.weekdays_paid}/249 weekdays</p>
                    </div>
                    <StatusBadge status={holding.status as any} />
                    <span className="text-[#95d5b2]">
                      {expandedHolding === holding.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </span>
                  </div>
                </button>

                {expandedHolding === holding.id && (
                  <div className="px-5 pb-5 bg-[#fafdf7] border-t border-[#d8f3dc]">
                    {/* Progress bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-[#52796f]">Progress</span>
                        <span className="font-semibold text-[#2d6a4f]">{Math.round(holding.progress_percent)}%</span>
                      </div>
                      <div className="h-2 bg-[#d8f3dc] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#2d6a4f] rounded-full transition-all"
                          style={{ width: `${Math.min(holding.progress_percent, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Payouts Table */}
                    <h4 className="font-semibold text-[#1a2e1a] mb-3">Payout History</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-xs text-[#52796f] border-b border-[#d8f3dc]">
                            <th className="pb-2">Date</th>
                            <th className="pb-2 text-right">Amount</th>
                            <th className="pb-2 text-right">Running Total</th>
                            <th className="pb-2 text-center">Weekday #</th>
                            <th className="pb-2 text-center">Status</th>
                            <th className="pb-2 text-center">Paid At</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#d8f3dc]">
                          {holding.payouts.length === 0 ? (
                            <tr>
                              <td className="py-4 text-center text-[#95d5b2]" colSpan={6}>No payouts yet</td>
                            </tr>
                          ) : (
                            holding.payouts.map(payout => (
                              <tr key={payout.id} className="hover:bg-white transition-colors">
                                <td className="py-2 text-[#1a2e1a]">{format(new Date(payout.payout_date), 'dd MMM yyyy')}</td>
                                <td className="py-2 text-right text-[#2d6a4f] font-medium">+{formatINR(payout.amount)}</td>
                                <td className="py-2 text-right text-[#52796f]">{formatINR(payout.running_total)}</td>
                                <td className="py-2 text-center text-[#52796f]">#{payout.weekdays_paid}</td>
                                <td className="py-2 text-center">
                                  {payout.marked_by ? (
                                    <span className="inline-block px-2 py-1 bg-[#dcfce7] text-[#166534] text-xs font-semibold rounded-full">Paid</span>
                                  ) : (
                                    <span className="inline-block px-2 py-1 bg-[#fef3c7] text-[#92400e] text-xs font-semibold rounded-full">Pending</span>
                                  )}
                                </td>
                                <td className="py-2 text-center text-xs text-[#95d5b2]">
                                  {payout.marked_at ? format(new Date(payout.marked_at), 'dd MMM, h:mm a') : '—'}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-[#fafdf7] rounded-xl">
      <p className="text-xs text-[#52796f]">{label}</p>
      <p className="font-medium text-[#1a2e1a]">{value}</p>
    </div>
  );
}

function maskAccountNumber(value?: string | null): string {
  if (!value) return 'Not set';
  return `••••${value.slice(-4)}`;
}

function StatusBadge({ status }: { status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'COMPLETED' }) {
  const styles = {
    PENDING: 'bg-[#fef3c7] text-[#92400e]',
    APPROVED: 'bg-[#dcfce7] text-[#166534]',
    REJECTED: 'bg-[#fee2e2] text-[#b91c1c]',
    ACTIVE: 'bg-[#dbeafe] text-[#1d4ed8]',
    COMPLETED: 'bg-[#dcfce7] text-[#166534]',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, CheckCircle2, Loader2, Users, TrendingUp, BadgeCheck } from 'lucide-react';
import { format } from 'date-fns';
import { formatINR } from '@/lib/utils/currency';

interface PayoutItem {
  id: string;
  holding_id: string;
  holding: {
    id: string;
    shares: number;
    amount_invested: number;
    daily_payout: number;
    weekdays_paid: number;
    user: {
      id: string;
      name: string | null;
      email: string;
      phone: string | null;
      profiles?: Array<{
        phone: string | null;
        account_holder_name: string | null;
        account_number: string | null;
        ifsc_code: string | null;
        upi_id: string | null;
      }> | null;
    };
  } | null;
  amount: number;
  running_total: number;
  weekdays_paid?: number;
  payout_date: string;
  marked_by: string | null;
  marked_at: string | null;
}

interface TodayPayoutResponse {
  pending: PayoutItem[];
  paid: PayoutItem[];
  nearingCompletion: PayoutItem[];
  completed: PayoutItem[];
}

async function fetchToday(): Promise<TodayPayoutResponse> {
  const res = await fetch('/api/admin/payouts/today');
  if (!res.ok) throw new Error('Failed to load payouts');
  return res.json();
}

export default function AdminPayoutsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['adminPayoutsToday'],
    queryFn: fetchToday,
    refetchInterval: 60000,
  });

  const markPaid = useMutation({
    mutationFn: async (payoutId: string) => {
      const res = await fetch('/api/admin/payouts/mark-paid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payoutId }),
      });
      if (!res.ok) throw new Error('Failed to mark payout');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPayoutsToday'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
  });

  const markAllPaid = useMutation({
    mutationFn: async (payoutIds: string[]) => {
      const res = await fetch('/api/admin/payouts/mark-all-paid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payoutIds }),
      });
      if (!res.ok) throw new Error('Failed to mark payouts');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPayoutsToday'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center border border-[#d8f3dc]">
        <Loader2 className="w-10 h-10 text-[#2d6a4f] animate-spin mx-auto mb-4" />
        <p className="text-[#52796f]">Loading today&apos;s payout queue...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center border border-[#fecaca]">
        <p className="text-[#dc2626]">Failed to load today&apos;s payouts.</p>
      </div>
    );
  }

  const { pending, paid } = data;
  const totalPending = pending.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1a2e1a]">Daily Payout Console</h1>
        <p className="text-sm text-[#52796f] mt-1 flex items-center gap-2">
          <CalendarDays className="w-4 h-4" />
          {format(new Date(), 'EEEE, dd MMMM yyyy')} — {format(new Date(), 'cccc') === 'Saturday' || format(new Date(), 'cccc') === 'Sunday' ? 'Weekend (payouts apply to weekdays)' : 'Weekday'}
</p>
        <p className="text-xs text-[#95d5b2] mt-1">
          New payouts appear at 6:00 AM on weekdays. First payout is generated 24 hours after a purchase is approved, then one payout per weekday.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryBox
          label="Pending Payouts"
          value={formatINR(totalPending)}
          count={`${pending.length} investor${pending.length === 1 ? '' : 's'}`}
          icon={Users}
          color="bg-[#fef3c7] text-[#92400e]"
        />
        <SummaryBox
          label="Marked Paid Today"
          value={formatINR(paid.reduce((s, p) => s + p.amount, 0))}
          count={`${paid.length} payout${paid.length === 1 ? '' : 's'}`}
          icon={BadgeCheck}
          color="bg-[#dcfce7] text-[#166534]"
        />
        <SummaryBox
          label="Total Today"
          value={formatINR(data.pending.length + data.paid.length ? (data.pending.reduce((s, p) => s + p.amount, 0) + data.paid.reduce((s, p) => s + p.amount, 0)) : 0)}
          count={`${data.pending.length + data.paid.length} active holdings`}
          icon={TrendingUp}
          color="bg-[#d8f3dc] text-[#2d6a4f]"
        />
      </div>

      {/* Actions */}
      {pending.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#d8f3dc] p-4 flex items-center justify-between flex-wrap gap-4">
          <p className="text-sm text-[#52796f]">
            <strong className="text-[#92400e]">{pending.length} payout{pending.length === 1 ? '' : 's'}</strong> awaiting payment confirmation.
          </p>
          <button
            onClick={() => markAllPaid.mutate(pending.map(p => p.id))}
            disabled={markAllPaid.isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2d6a4f] text-white text-sm font-semibold rounded-xl hover:bg-[#1a4d3a] transition-colors disabled:opacity-50"
          >
            {markAllPaid.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Mark All as Paid ({pending.length})
          </button>
        </div>
      )}

      {/* Pending */}
      <Section title={`Pending Payouts (${pending.length})`}>
        {pending.length === 0 ? (
          <EmptyState text="All payouts are marked as paid today. Great job! 🎉" />
        ) : (
          <div className="divide-y divide-[#d8f3dc]">
            {pending.map(item => {
              const holding = item.holding;
              const profile = holding?.user?.profiles?.[0] ?? null;
              return (
                <div key={item.id} className="px-4 py-3">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#d8f3dc] flex items-center justify-center text-[#2d6a4f] font-bold text-sm flex-shrink-0">
                        {holding?.user.name?.[0]?.toUpperCase() ?? holding?.user.email[0]?.toUpperCase() ?? 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-[#1a2e1a]">{holding?.user.name || holding?.user.email}</p>
                        <p className="text-xs text-[#52796f]">
                          {holding ? `${holding.shares} share${holding.shares > 1 ? 's' : ''} · weekday #${Math.max(1, (holding.weekdays_paid || 0) + 1)} · ${holding.user.email}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-[#2d6a4f]">{formatINR(item.amount)}</p>
                        <p className="text-xs text-[#95d5b2]">running total {formatINR(item.running_total)}</p>
                      </div>
                      <button
                        onClick={() => markPaid.mutate(item.id)}
                        disabled={markPaid.isPending}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#dcfce7] text-[#166534] text-sm font-semibold rounded-xl hover:bg-[#bbf7d0] transition-colors disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Mark Paid
                      </button>
                    </div>
                  </div>
                  {profile && (
                    <div className="mt-3 flex items-center justify-between flex-wrap gap-3 bg-[#fafdf7] border border-[#d8f3dc] rounded-xl px-4 py-3">
                      <div className="flex items-center gap-4 flex-wrap text-sm">
                        <span className="text-[#52796f]">📍 <span className="font-medium text-[#1a2e1a]">{profile.account_holder_name || '—'}</span></span>
                        <span className="text-[#52796f]">A/C <span className="font-medium text-[#1a2e1a]">••••{profile.account_number?.slice(-4) || '—'}</span></span>
                        <span className="text-[#52796f]">IFSC <span className="font-medium text-[#1a2e1a]">{profile.ifsc_code || '—'}</span></span>
                        <span className="text-[#52796f]">UPI <span className="font-medium text-[#1a2e1a]">{profile.upi_id || '—'}</span></span>
                      </div>
                      {profile.upi_id && (
                        <a
                          href={`upi://pay?pa=${encodeURIComponent(profile.upi_id)}&pn=${encodeURIComponent(profile.account_holder_name || holding?.user.name || '')}&am=${item.amount}&cu=INR`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a73e8] text-white text-sm font-semibold rounded-xl hover:bg-[#1558b0] transition-colors"
                        >
                          Pay via GPay
                        </a>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Section>

      {/* Paid */}
      <Section title={`Paid Today (${paid.length})`}>
        {paid.length === 0 ? (
          <EmptyState text="No payouts marked as paid yet." />
        ) : (
          <div className="divide-y divide-[#d8f3dc]">
            {paid.map(item => (
              <div key={item.id} className="flex items-center justify-between flex-wrap gap-3 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#dcfce7] flex items-center justify-center text-[#166534] font-bold text-sm flex-shrink-0">
                    {item.holding?.user.name?.[0]?.toUpperCase() ?? item.holding?.user.email[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <div>
                    <p className="font-medium text-[#1a2e1a]">{item.holding?.user.name || item.holding?.user.email}</p>
                    <p className="text-xs text-[#52796f]">
                      {format(item.marked_at ? new Date(item.marked_at) : new Date(), 'h:mm a')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#166534]">{formatINR(item.amount)}</p>
                  <p className="text-xs text-[#95d5b2]">running total {formatINR(item.running_total)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Nearing completion */}
      {data.nearingCompletion.length > 0 && (
        <Section title={`Nearing Completion (${data.nearingCompletion.length})`}>
          <div className="divide-y divide-[#d8f3dc]">
            {data.nearingCompletion.map(item => {
              const holding = item.holding;
              return (
                <div key={item.id} className="flex items-center justify-between flex-wrap gap-3 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#fef3c7] flex items-center justify-center text-[#92400e] font-bold text-sm flex-shrink-0">
                      {holding?.user.name?.[0]?.toUpperCase() ?? holding?.user.email[0]?.toUpperCase() ?? 'U'}
                    </div>
                    <div>
                      <p className="font-medium text-[#1a2e1a]">{holding?.user.name || holding?.user.email}</p>
                      <p className="text-xs text-[#52796f]">
                        {holding ? `${holding.shares} share${holding.shares > 1 ? 's' : ''} · weekday #${holding.weekdays_paid + 1}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#92400e]">{formatINR(item.amount)}</p>
                    <p className="text-xs text-[#95d5b2]">running total {formatINR(item.running_total)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* Completed */}
      {data.completed.length > 0 && (
        <Section title={`Completed (${data.completed.length})`}>
          <div className="divide-y divide-[#d8f3dc]">
            {data.completed.map(item => (
              <div key={item.id} className="flex items-center justify-between flex-wrap gap-3 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#dbeafe] flex items-center justify-center text-[#1d4ed8] font-bold text-sm flex-shrink-0">
                    {item.holding?.user.name?.[0]?.toUpperCase() ?? item.holding?.user.email[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <div>
                    <p className="font-medium text-[#1a2e1a]">{item.holding?.user.name || item.holding?.user.email}</p>
                    <p className="text-xs text-[#52796f]">
                      {item.holding ? `${item.holding.shares} share${item.holding.shares > 1 ? 's' : ''}` : ''} · full cycle completed
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#1d4ed8]">{formatINR(item.amount)}</p>
                  <p className="text-xs text-[#95d5b2]">final payout</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function SummaryBox({ label, value, count, icon: Icon, color }: {
  label: string;
  value: string;
  count: string;
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
      <p className="text-xs text-[#95d5b2] mt-1">{count}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[#d8f3dc] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-[#f0f7f0] border-b border-[#d8f3dc]">
        <h2 className="font-bold text-[#1a2e1a] text-base">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="p-8 text-center">
      <TrendingUp className="w-10 h-10 text-[#95d5b2] mx-auto mb-3" />
      <p className="text-[#52796f] text-sm">{text}</p>
    </div>
  );
}
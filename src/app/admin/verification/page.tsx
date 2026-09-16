'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, ChevronLeft, ChevronRight, Loader2, CheckCircle2, XCircle, FileText, ExternalLink, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { formatINR } from '@/lib/utils/currency';

interface VerificationRequest {
  id: string;
  user_id: string;
  shares: number;
  amount: number;
  daily_payout: number;
  total_projected_return: number;
  screenshot_url: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejection_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar_url: string | null;
  };
}

interface VerificationResponse {
  requests: VerificationRequest[];
  total: number;
  page: number;
  pageSize: number;
}

async function fetchRequests(params: { page: number; search: string; status: string }): Promise<VerificationResponse> {
  const query = new URLSearchParams({ page: String(params.page), search: params.search, status: params.status });
  const res = await fetch(`/api/admin/verification?${query}`);
  if (!res.ok) throw new Error('Failed to load verification requests');
  return res.json();
}

export default function AdminVerificationPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [searchInput, setSearchInput] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['adminVerification', page, search, status],
    queryFn: () => fetchRequests({ page, search, status }),
  });

  const approve = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/verification/${id}/approve`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to approve');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminVerification'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
  });

  const reject = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await fetch(`/api/admin/verification/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error('Failed to reject');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminVerification'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
  });

  const pageSize = data?.pageSize ?? 10;
  const totalPages = data ? Math.ceil(data.total / pageSize) : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1a2e1a]">Verification Queue</h1>
        <p className="text-sm text-[#52796f] mt-1">Review payment screenshots and approve or reject purchases</p>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-[#d8f3dc] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 text-[#95d5b2] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (setSearch(searchInput.trim()), setPage(1))}
              placeholder="Search by email or name..."
              className="pl-9 pr-3 py-2 bg-[#f0f7f0] border border-transparent rounded-xl text-sm focus:outline-none focus:border-[#2d6a4f] w-64"
            />
          </div>
          <button
            onClick={() => { setSearch(searchInput.trim()); setPage(1); }}
            className="px-4 py-2 bg-[#2d6a4f] text-white text-sm font-semibold rounded-xl hover:bg-[#1a4d3a] transition-colors"
          >
            Search
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#52796f]">Status:</span>
          <select
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-[#f0f7f0] rounded-xl text-sm focus:outline-none focus:border-[#2d6a4f]"
          >
            <option value="all">All</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-[#d8f3dc]">
          <Loader2 className="w-10 h-10 text-[#2d6a4f] animate-spin mx-auto mb-4" />
          <p className="text-[#52796f]">Loading verification requests...</p>
        </div>
      ) : error || !data ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-[#fecaca]">
          <p className="text-[#dc2626]">Failed to load verification requests.</p>
        </div>
      ) : data.requests.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-[#d8f3dc]">
          <FileText className="w-16 h-16 text-[#95d5b2] mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[#1a2e1a] mb-2">No requests found</h3>
          <p className="text-[#52796f]">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.requests.map(request => (
            <div key={request.id} className="bg-white rounded-2xl border border-[#d8f3dc] overflow-hidden">
              <div className="p-5 flex items-start justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-[#d8f3dc] overflow-hidden flex-shrink-0">
                    {request.user.avatar_url ? (
                      <img src={request.user.avatar_url} alt={request.user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#2d6a4f] font-bold">
                        {request.user.name?.[0]?.toUpperCase() ?? 'U'}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-[#1a2e1a]">{request.user.name || 'Unknown'}</p>
                    <p className="text-sm text-[#52796f]">{request.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={request.status} />
                  <span className="text-xs text-[#95d5b2]">{format(new Date(request.created_at), 'dd MMM yyyy, h:mm a')}</span>
                </div>
              </div>

              <div className="px-5 pb-5 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#fafdf7] rounded-xl p-3">
                  <p className="text-xs text-[#52796f] mb-1">Shares Requested</p>
                  <p className="font-bold text-[#1a2e1a] flex items-center gap-1">
                    <Share2 className="w-4 h-4 text-[#2d6a4f]" />
                    {request.shares}
                  </p>
                </div>
                <div className="bg-[#fafdf7] rounded-xl p-3">
                  <p className="text-xs text-[#52796f] mb-1">Amount Paid</p>
                  <p className="font-bold text-[#1a2e1a]">{formatINR(request.amount)}</p>
                </div>
                <div className="bg-[#fafdf7] rounded-xl p-3">
                  <p className="text-xs text-[#52796f] mb-1">Daily Payout</p>
                  <p className="font-bold text-[#2d6a4f]">{formatINR(request.daily_payout)}/day</p>
                </div>
                <div className="bg-[#fafdf7] rounded-xl p-3">
                  <p className="text-xs text-[#52796f] mb-1">Total Return</p>
                  <p className="font-bold text-[#1a2e1a]">{formatINR(request.total_projected_return)}</p>
                </div>
              </div>

              <div className="px-5 pb-5 flex items-center justify-between flex-wrap gap-4 border-t border-[#d8f3dc] pt-4">
                <a
                  href={request.screenshot_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-[#2d6a4f] font-semibold hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  View payment screenshot
                </a>

                {request.status === 'PENDING' && (
                  <div className="flex items-center gap-3">
                    {reject.isPending && <Loader2 className="w-4 h-4 animate-spin text-[#52796f]" />}
                    <button
                      onClick={() => {
                        const reason = window.prompt('Rejection reason (sent to the user):', 'Payment screenshot could not be verified. Please contact support.');
                        if (reason) reject.mutate({ id: request.id, reason });
                        else if (reason === '') reject.mutate({ id: request.id, reason: 'Payment could not be verified.' });
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#fef2f2] text-[#b91c1c] text-sm font-semibold rounded-xl hover:bg-[#fee2e2] transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                    <button
                      onClick={() => approve.mutate(request.id)}
                      disabled={approve.isPending}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#2d6a4f] text-white text-sm font-semibold rounded-xl hover:bg-[#1a4d3a] transition-colors disabled:opacity-50"
                    >
                      {approve.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                      <CheckCircle2 className="w-4 h-4" />
                      Approve
                    </button>
                  </div>
                )}

                {request.status === 'REJECTED' && request.rejection_reason && (
                  <p className="text-sm text-[#b91c1c] flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    {request.rejection_reason}
                  </p>
                )}
              </div>
            </div>
          ))}

          <div className="bg-white rounded-2xl border border-[#d8f3dc] px-4 py-3 flex items-center justify-between">
            <p className="text-sm text-[#52796f]">Page {data.page} of {totalPages}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex items-center gap-1 px-3 py-2 bg-[#f0f7f0] text-[#52796f] rounded-xl text-sm font-medium hover:bg-[#d8f3dc] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="flex items-center gap-1 px-3 py-2 bg-[#f0f7f0] text-[#52796f] rounded-xl text-sm font-medium hover:bg-[#d8f3dc] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: VerificationRequest['status'] }) {
  const styles = {
    PENDING: 'bg-[#fef3c7] text-[#92400e]',
    APPROVED: 'bg-[#dcfce7] text-[#166534]',
    REJECTED: 'bg-[#fee2e2] text-[#b91c1c]',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}
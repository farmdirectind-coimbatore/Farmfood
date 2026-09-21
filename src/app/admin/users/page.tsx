'use client';

import { useState, Fragment } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Loader2, Users, Phone, Landmark, BadgeInfo, Trash2, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { formatINR } from '@/lib/utils/currency';

interface AdminUser {
  id: string;
  supabase_id: string;
  email: string;
  name: string;
  phone: string | null;
  avatar_url: string | null;
  role: 'ADMIN' | 'USER';
  created_at: string;
  profile: {
    phone: string | null;
    account_holder_name: string | null;
    account_number: string | null;
    ifsc_code: string | null;
    upi_id: string | null;
  } | null;
  _stats: {
    total_lots: number;
    total_invested: number;
    pending_requests: number;
  };
}

interface UsersResponse {
  users: AdminUser[];
  total: number;
  page: number;
  pageSize: number;
}

async function fetchUsers(params: { page: number; search: string; role: string; sort: string }): Promise<UsersResponse> {
  const query = new URLSearchParams({
    page: String(params.page),
    search: params.search,
    role: params.role,
    sort: params.sort,
  });
  const res = await fetch(`/api/admin/users?${query}`);
  if (!res.ok) throw new Error('Failed to load users');
  return res.json();
}

async function deleteUser(userId: string): Promise<void> {
  const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete user');
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [sort, setSort] = useState('newest');
  const [searchInput, setSearchInput] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['adminUsers', page, search, role, sort],
    queryFn: () => fetchUsers({ page, search, role, sort }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      setDeleteConfirmId(null);
    },
  });

  const applySearch = () => {
    setSearch(searchInput.trim());
    setPage(1);
  };

  const pageSize = data?.pageSize ?? 10;
  const totalPages = data ? Math.ceil(data.total / pageSize) : 1;

  const handleDeleteClick = (userId: string, userName: string, userRole: string) => {
    if (userRole === 'ADMIN') {
      alert('Cannot delete admin users');
      return;
    }
    if (confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      deleteMutation.mutate(userId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2e1a]">Users</h1>
          <p className="text-sm text-[#52796f] mt-1">{data?.total ?? '—'} total users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-[#d8f3dc] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 text-[#95d5b2] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applySearch()}
              placeholder="Search by email, name or phone..."
              className="pl-9 pr-3 py-2 bg-[#f0f7f0] border border-transparent rounded-xl text-sm focus:outline-none focus:border-[#2d6a4f] w-64"
            />
          </div>
          <button
            onClick={applySearch}
            className="px-4 py-2 bg-[#2d6a4f] text-white text-sm font-semibold rounded-xl hover:bg-[#1a4d3a] transition-colors"
          >
            Search
          </button>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-[#52796f]">Role:</span>
          <select
            value={role}
            onChange={e => { setRole(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-[#f0f7f0] rounded-xl text-sm focus:outline-none focus:border-[#2d6a4f]"
          >
            <option value="all">All</option>
            <option value="ADMIN">Admins</option>
            <option value="USER">Users</option>
          </select>
          <span className="text-sm text-[#52796f] ml-2">Sort:</span>
          <select
            value={sort}
            onChange={e => { setSort(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-[#f0f7f0] rounded-xl text-sm focus:outline-none focus:border-[#2d6a4f]"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="lots">Most Lots</option>
            <option value="invested">Most Invested</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-[#d8f3dc]">
          <Loader2 className="w-10 h-10 text-[#2d6a4f] animate-spin mx-auto mb-4" />
          <p className="text-[#52796f]">Loading users...</p>
        </div>
      ) : error || !data ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-[#fecaca]">
          <p className="text-[#dc2626]">Failed to load users.</p>
        </div>
      ) : data.users.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-[#d8f3dc]">
          <Users className="w-16 h-16 text-[#95d5b2] mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[#1a2e1a] mb-2">No users found</h3>
          <p className="text-[#52796f]">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#d8f3dc] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f0f7f0]">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#52796f]">User</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#52796f]">Role</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-[#52796f]">Lots</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-[#52796f]">Invested</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[#52796f]">Pending</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#52796f]">Joined</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[#52796f]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d8f3dc]">
                {data.users.map(user => (
                  <Fragment key={user.id}>
                  <tr className="hover:bg-[#fafdf7] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#d8f3dc] overflow-hidden flex-shrink-0 relative">
                          {user.avatar_url ? (
                            <Image
                              src={user.avatar_url}
                              alt={user.name}
                              fill
                              className="object-cover"
                              sizes="36px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#2d6a4f] font-bold">
                              {user.name?.[0]?.toUpperCase() ?? 'U'}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-[#1a2e1a]">{user.name || '—'}</p>
                          <p className="text-xs text-[#52796f]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'ADMIN' ? 'bg-[#dbeafe] text-[#1d4ed8]' : 'bg-[#dcfce7] text-[#166534]'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-[#1a2e1a]">
                      {user._stats.total_lots}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-[#1a2e1a]">
                      {formatINR(user._stats.total_invested)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {user._stats.pending_requests > 0 ? (
                        <span className="px-2.5 py-1 bg-[#fef3c7] text-[#92400e] text-xs font-semibold rounded-full">
                          {user._stats.pending_requests}
                        </span>
                      ) : (
                        <span className="text-xs text-[#95d5b2]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#52796f]">
                      {format(new Date(user.created_at), 'dd MMM yyyy')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setExpandedId(expandedId === user.id ? null : user.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#f0f7f0] text-[#2d6a4f] text-xs font-semibold rounded-lg hover:bg-[#d8f3dc] transition-colors"
                        >
                          {expandedId === user.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          Details
                        </button>
                        {user.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleDeleteClick(user.id, user.name || user.email, user.role)}
                            disabled={deleteMutation.isPending}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#fef2f2] text-[#dc2626] text-xs font-semibold rounded-lg hover:bg-[#fecaca] transition-colors disabled:opacity-50"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedId === user.id && (
                    <tr className="bg-[#fafdf7]">
                      <td colSpan={7} className="px-4 py-4">
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <DetailBox icon={Phone} label="Phone" value={user.profile?.phone || 'Not set'} />
                          <DetailBox icon={Landmark} label="Account Holder" value={user.profile?.account_holder_name || 'Not set'} />
                          <DetailBox icon={Landmark} label="Account Number" value={maskAccountNumber(user.profile?.account_number)} />
                          <DetailBox icon={BadgeInfo} label="IFSC Code" value={user.profile?.ifsc_code || 'Not set'} />
                          <DetailBox icon={BadgeInfo} label="UPI ID" value={user.profile?.upi_id || 'Not set'} />
                          <DetailBox icon={Users} label="Total Lots" value={String(user._stats.total_lots)} />
                          <DetailBox icon={Users} label="Total Invested" value={formatINR(user._stats.total_invested)} />
                        </div>
                        <div className="mt-4 pt-4 border-t border-[#d8f3dc] flex justify-end">
                          {user.role !== 'ADMIN' && (
                            <button
                              onClick={() => handleDeleteClick(user.id, user.name || user.email, user.role)}
                              disabled={deleteMutation.isPending}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-[#fef2f2] text-[#dc2626] text-sm font-semibold rounded-xl hover:bg-[#fecaca] transition-colors disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4" />
                              <AlertCircle className="w-4 h-4" />
                              Delete User
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-3 border-t border-[#d8f3dc] flex items-center justify-between">
            <p className="text-sm text-[#52796f]">
              Page {data.page} of {totalPages}
            </p>
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

function maskAccountNumber(value?: string | null): string {
  if (!value) return 'Not set';
  return `••••${value.slice(-4)}`;
}

function DetailBox({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#d8f3dc]">
      <div className="w-9 h-9 rounded-lg bg-[#d8f3dc] flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-[#2d6a4f]" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-[#52796f]">{label}</p>
        <p className="text-sm font-medium text-[#1a2e1a] truncate" title={value}>{value}</p>
      </div>
    </div>
  );
}
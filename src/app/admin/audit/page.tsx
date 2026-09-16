'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, ChevronLeft, ChevronRight, Loader2, ClipboardList, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';

interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  created_at: string;
  admin: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

interface AuditResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  pageSize: number;
}

const ACTION_FILTERS = ['all', 'create_purchase_request', 'approve_purchase', 'reject_purchase', 'mark_payout_paid', 'update_bank_details'] as const;
const ENTITY_FILTERS = ['all', 'purchase_request', 'holding', 'payout', 'user', 'bank_details'] as const;

async function fetchLogs(params: { page: number; search: string; action: string; entityType: string }): Promise<AuditResponse> {
  const query = new URLSearchParams({
    page: String(params.page),
    search: params.search,
    action: params.action,
    entityType: params.entityType,
  });
  const res = await fetch(`/api/admin/audit?${query}`);
  if (!res.ok) throw new Error('Failed to load audit logs');
  return res.json();
}

function actionLabel(action: string): string {
  switch (action) {
    case 'create_purchase_request': return 'Submitted Purchase';
    case 'approve_purchase': return 'Approved Purchase';
    case 'reject_purchase': return 'Rejected Purchase';
    case 'mark_payout_paid': return 'Marked Payout';
    case 'update_bank_details': return 'Updated Bank Details';
    default: return action;
  }
}

export default function AdminAuditPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('all');
  const [entityType, setEntityType] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const { data, isLoading, error } = useQuery({
    queryKey: ['adminAudit', page, search, action, entityType],
    queryFn: () => fetchLogs({ page, search, action, entityType }),
  });

  const pageSize = data?.pageSize ?? 50;
  const totalPages = data ? Math.ceil(data.total / pageSize) : 1;

  const toggle = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1a2e1a]">Audit Log</h1>
        <p className="text-sm text-[#52796f] mt-1">Track all administrative actions</p>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-[#d8f3dc] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 text-[#95d5b2] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (setSearch(searchInput.trim()), setPage(1))}
              placeholder="Search admin, action, entity..."
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
        <div className="flex items-center gap-3 flex-wrap">
          <div>
            <span className="text-sm text-[#52796f] mr-2">Action:</span>
            <select
              value={action}
              onChange={e => { setAction(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-[#f0f7f0] rounded-xl text-sm focus:outline-none focus:border-[#2d6a4f]"
            >
              {ACTION_FILTERS.map(a => (
                <option key={a} value={a}>{a === 'all' ? 'All actions' : actionLabel(a)}</option>
              ))}
            </select>
          </div>
          <div>
            <span className="text-sm text-[#52796f] mr-2">Entity:</span>
            <select
              value={entityType}
              onChange={e => { setEntityType(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-[#f0f7f0] rounded-xl text-sm focus:outline-none focus:border-[#2d6a4f]"
            >
              {ENTITY_FILTERS.map(e => (
                <option key={e} value={e}>{e === 'all' ? 'All entities' : e}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-[#d8f3dc]">
          <Loader2 className="w-10 h-10 text-[#2d6a4f] animate-spin mx-auto mb-4" />
          <p className="text-[#52796f]">Loading audit log...</p>
        </div>
      ) : error || !data ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-[#fecaca]">
          <p className="text-[#dc2626]">Failed to load audit log.</p>
        </div>
      ) : data.logs.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-[#d8f3dc]">
          <ClipboardList className="w-16 h-16 text-[#95d5b2] mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[#1a2e1a] mb-2">No audit entries found</h3>
          <p className="text-[#52796f]">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#d8f3dc] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f0f7f0]">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#52796f]">Action</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#52796f]">Entity</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#52796f]">Admin</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#52796f]">Time</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[#52796f]">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d8f3dc]">
                {data.logs.map(log => (
                  <LogRow key={log.id} log={log} expanded={expanded.has(log.id)} onToggle={() => toggle(log.id)} />
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-t border-[#d8f3dc] flex items-center justify-between">
            <p className="text-sm text-[#52796f]">Page {data.page} of {totalPages} · {data.total} entries</p>
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

function LogRow({ log, expanded, onToggle }: { log: AuditLog; expanded: boolean; onToggle: () => void }) {
  return (
    <>
      <tr className="hover:bg-[#fafdf7] transition-colors cursor-pointer" onClick={onToggle}>
        <td className="px-4 py-3">
          <span className="inline-block px-2.5 py-1 bg-[#d8f3dc] text-[#2d6a4f] text-xs font-semibold rounded-full">
            {actionLabel(log.action)}
          </span>
        </td>
        <td className="px-4 py-3">
          <p className="text-sm font-medium text-[#1a2e1a]">{log.entity_type}</p>
          <p className="text-xs text-[#95d5b2]">{log.entity_id.slice(0, 8)}</p>
        </td>
        <td className="px-4 py-3 text-sm text-[#1a2e1a]">
          {log.admin?.name || log.admin?.email || '—'}
        </td>
        <td className="px-4 py-3 text-sm text-[#52796f]">
          {format(new Date(log.created_at), 'dd MMM yyyy, h:mm a')}
        </td>
        <td className="px-4 py-3 text-center">
          {log.new_data || log.old_data ? (
            <span className="inline-flex text-[#2d6a4f]">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </span>
          ) : (
            <span className="text-xs text-[#95d5b2]">—</span>
          )}
        </td>
      </tr>
      {expanded && (log.new_data || log.old_data) && (
        <tr className="bg-[#fafdf7]">
          <td colSpan={5} className="px-4 py-4 space-y-3">
            {log.old_data && (
              <div>
                <p className="text-xs font-semibold text-[#b91c1c] mb-1">Before</p>
                <pre className="text-xs bg-white border border-[#d8f3dc] rounded-xl p-3 overflow-x-auto whitespace-pre-wrap break-words">
                  {JSON.stringify(log.old_data, null, 2)}
                </pre>
              </div>
            )}
            {log.new_data && (
              <div>
                <p className="text-xs font-semibold text-[#166534] mb-1">After</p>
                <pre className="text-xs bg-white border border-[#d8f3dc] rounded-xl p-3 overflow-x-auto whitespace-pre-wrap break-words">
                  {JSON.stringify(log.new_data, null, 2)}
                </pre>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}
'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

async function fetchRole(): Promise<{ role: string }> {
  const res = await fetch('/api/dashboard/role');
  if (res.status === 401) return { role: 'USER' };
  if (!res.ok) throw new Error('Failed to fetch role');
  return res.json();
}

export default function AdminDashboardLink({ compact = false }: { compact?: boolean }) {
  const { data, isLoading } = useQuery({
    queryKey: ['user-role'],
    queryFn: fetchRole,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading || !data || data.role !== 'ADMIN') return null;

  if (compact) {
    return (
      <Link
        href="/admin"
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#d8f3dc] text-[#2d6a4f] hover:bg-[#d8f3dc]/70 transition-colors"
        title="Admin Dashboard"
        aria-label="Admin Dashboard"
      >
        <ShieldCheck className="w-5 h-5" />
      </Link>
    );
  }

  return (
    <Link
      href="/admin"
      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#d8f3dc] text-[#2d6a4f] hover:bg-[#c8ecc9] transition-colors font-semibold"
    >
      <ShieldCheck className="w-5 h-5" />
      <span>Admin Dashboard</span>
    </Link>
  );
}
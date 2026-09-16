'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Leaf, Loader2 } from 'lucide-react';
import { PurchaseForm } from '@/components/forms/PurchaseForm';

async function fetchProfile() {
  const res = await fetch('/api/dashboard/profile');
  if (!res.ok) throw new Error('Failed to load profile');
  return res.json();
}

export default function BuySharesPage() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#2d6a4f] animate-spin" />
      </div>
    );
  }

  if (profile && !profile.phone) {
    return (
      <div className="min-h-screen bg-[#f5f5f0]">
        <header className="bg-[#1a2e1a] border-b border-white/10 sticky top-0 z-40">
          <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5 text-white/70 hover:text-white" />
            </Link>
            <img src="/images/logo.png" alt="FarmDirect" className="h-10 w-auto" />
            <div className="w-8" />
          </div>
        </header>
        <main className="max-w-lg mx-auto px-6 py-20 text-center">
          <div className="bg-white rounded-3xl p-8 border border-[#d8f3dc] shadow-lg">
            <Leaf className="w-12 h-12 text-[#95d5b2] mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[#1a2e1a] mb-3">Complete your account</h1>
            <p className="text-[#52796f] text-sm mb-6">
              Please set up your name and phone number before buying shares.
            </p>
            <Link
              href="/welcome"
              className="inline-flex items-center gap-2 bg-[#2d6a4f] text-white font-semibold py-3 px-6 rounded-2xl hover:bg-[#1a4d3a] transition-colors"
            >
              Go to Setup
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      {/* Header */}
      <header className="bg-[#1a2e1a] border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <ArrowLeft className="w-5 h-5 text-white/70 hover:text-white" />
          </Link>
          <img src="/images/logo.png" alt="FarmDirect" className="h-10 w-auto" />
          <div className="w-8" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 pb-20">
        <div className="mb-8 text-center">
          <Leaf className="w-12 h-12 text-[#2d6a4f] mx-auto mb-3" />
          <h1 className="text-3xl font-bold text-[#1a2e1a]">Buy Shares</h1>
          <p className="text-[#52796f] mt-2">1 Share = ₹10,000 · 1% Daily Return on Weekdays · 249 Days</p>
        </div>

        <PurchaseForm />
      </main>
    </div>
  );
}
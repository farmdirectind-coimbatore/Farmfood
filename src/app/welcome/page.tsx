'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Loader2, CheckCircle, Phone, User } from 'lucide-react';
import SignOutButton from '@/components/SignOutButton';

async function fetchProfile() {
  const res = await fetch('/api/dashboard/profile');
  if (!res.ok) throw new Error('Failed to load profile');
  return res.json();
}

export default function WelcomePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
  });

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const saveMutation = useMutation({
    mutationFn: async (payload: { name: string; phone: string }) => {
      const res = await fetch('/api/dashboard/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      setSubmitted(true);
      // Redirect to buy-lots after successful save
      router.push('/dashboard/buy-lots');
      router.refresh();
    },
  });

  const displayName = data?.user?.name || '';
  const hasSetup = !!data?.phone;

  // Pre-fill name once data loads
  if (data && !name && displayName && !phoneTouched) {
    setName(displayName);
  }

  const phoneValid = /^\d{10,}$/.test(phone.replace(/\s/g, ''));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f7f0]">
        <Loader2 className="w-8 h-8 text-[#2d6a4f] animate-spin" />
      </div>
    );
  }

  // If already has phone setup, redirect to buy-lots
  if (hasSetup && !submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f7f0]">
        <Loader2 className="w-8 h-8 text-[#2d6a4f] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f7f0]">
      {/* Header */}
      <header className="bg-[#1a2e1a] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center flex-shrink-0" aria-label="FarmDirect dashboard">
            <Image
              src="/images/logo.png"
              alt="FarmDirect"
              width={96}
              height={48}
            />
          </Link>
          <SignOutButton variant="light" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-12 pb-20">
        {/* Hero */}
        <section className="text-center mb-12">
          <span className="inline-block px-3 py-1 bg-[#d8f3dc] text-[#2d6a4f] rounded-full text-xs font-semibold mb-4 tracking-wide uppercase">
            Getting Started
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#1a2e1a] mb-4 leading-tight">
            {submitted
              ? 'You are all set!'
              : `Welcome${displayName ? ', ' + displayName.split(' ')[0] : ''}!`}
          </h1>
          <p className="text-[#52796f] text-base sm:text-lg max-w-xl mx-auto">
            {submitted
              ? 'You are ready to buy your first share and start earning daily returns.'
              : 'We just need your name and phone number to get your account started.'}
          </p>
        </section>

        {/* Step 1: Account Setup (only if phone not yet provided) */}
        {!submitted && !hasSetup && (
          <>
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border border-[#d8f3dc] mb-8">
            <h2 className="text-xl font-bold text-[#1a2e1a] mb-6">Set up your account</h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm text-[#52796f] mb-1.5 font-medium">Full Name</label>
                <div className="relative">
                  <User className="w-5 h-5 text-[#95d5b2] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full pl-10 pr-4 py-3 bg-[#f0f7f0] border border-transparent rounded-xl text-[#1a2e1a] text-sm focus:outline-none focus:border-[#2d6a4f] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-[#52796f] mb-1.5 font-medium">Phone Number *</label>
                <div className="relative">
                  <Phone className="w-5 h-5 text-[#95d5b2] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    onBlur={() => setPhoneTouched(true)}
                    placeholder="Enter your 10-digit mobile number"
                    className="w-full pl-10 pr-4 py-3 bg-[#f0f7f0] border border-transparent rounded-xl text-[#1a2e1a] text-sm focus:outline-none focus:border-[#2d6a4f] transition-colors"
                  />
                </div>
                {phoneTouched && phone && !phoneValid && (
                  <p className="text-xs text-[#dc2626] mt-1">Enter a valid phone number (minimum 10 digits)</p>
                )}
              </div>
            </div>
          </div>

            <button
              onClick={() => {
                setPhoneTouched(true);
                if (!phoneValid) return;
                saveMutation.mutate({
                  name: name.trim() || displayName || '',
                  phone: phone.replace(/\s/g, ''),
                });
              }}
              disabled={!phoneValid || saveMutation.isPending}
              className="w-full mt-6 inline-flex items-center justify-center gap-2 bg-[#2d6a4f] text-white font-semibold py-3.5 px-8 rounded-2xl shadow-md hover:bg-[#1a4d3a] hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-60"
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

{saveMutation.isError && (
              <p className="text-sm text-[#dc2626] mt-3 text-center">Something went wrong. Please try again.</p>
            )}
          </>
        )}

        {/* Step 2: Ready to buy */}
        {(submitted || hasSetup) && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border border-[#d8f3dc] text-center">
            <div className="w-16 h-16 bg-[#dcfce7] rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-8 h-8 text-[#166534]" />
            </div>
            <h2 className="text-xl font-bold text-[#1a2e1a] mb-3">Account setup complete</h2>
            <p className="text-[#52796f] text-sm mb-6 max-w-md mx-auto">
              Each share costs ₹10,000 and earns ₹100 daily (1%) on weekdays for 249 days. Select how many shares you want, transfer the amount, and upload your payment screenshot.
            </p>
            <Link
              href="/dashboard/buy-lots"
              className="inline-flex items-center gap-2 bg-[#2d6a4f] text-white font-semibold py-3.5 px-8 rounded-2xl shadow-md hover:bg-[#1a4d3a] hover:shadow-lg transition-all active:scale-[0.97]"
            >
              Buy Your First Lot
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
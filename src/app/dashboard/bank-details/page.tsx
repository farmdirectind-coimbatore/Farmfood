'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Loader2, CheckCircle, Building2, CreditCard, Hash, Smartphone } from 'lucide-react';
import SignOutButton from '@/components/SignOutButton';

async function fetchProfile() {
  const res = await fetch('/api/dashboard/profile');
  if (!res.ok) throw new Error('Failed to load profile');
  return res.json();
}

export default function BankDetailsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
  });

  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [upiId, setUpiId] = useState('');
  const [bankTouched, setBankTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const saveMutation = useMutation({
    mutationFn: async (payload: {
      account_holder_name: string;
      account_number: string;
      ifsc_code: string;
      upi_id?: string;
    }) => {
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
      router.push('/dashboard');
      router.refresh();
    },
  });

  const displayName = data?.user?.name || '';
  const hasBankDetails = !!data?.account_holder_name && !!data?.account_number && !!data?.ifsc_code;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f7f0]">
        <Loader2 className="w-8 h-8 text-[#2d6a4f] animate-spin" />
      </div>
    );
  }

  // If bank details already exist, redirect to dashboard
  if (hasBankDetails && !submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f7f0]">
        <Loader2 className="w-8 h-8 text-[#2d6a4f] animate-spin" />
      </div>
    );
  }

  const holderValid = accountHolderName.trim().length > 0;
  const accountValid = /^\d{9,18}$/.test(accountNumber.replace(/\s/g, ''));
  const ifscValid = /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode.trim().toUpperCase());
  const upiValid = upiId.trim() === '' || /^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(upiId.trim().replace(/\s/g, ''));
  const bankValid = holderValid && accountValid && ifscValid && upiValid;

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
            Step 2 of 2
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#1a2e1a] mb-4 leading-tight">
            {submitted
              ? 'All set!'
              : `Welcome${displayName ? ', ' + displayName.split(' ')[0] : ''}!`}
          </h1>
          <p className="text-[#52796f] text-base sm:text-lg max-w-xl mx-auto">
            {submitted
              ? 'Your bank details are saved. You can now track your investments.'
              : 'Now we need your bank details for daily payouts.'}
          </p>
        </section>

        {!submitted && !hasBankDetails && (
          <>
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border border-[#d8f3dc] mb-8">
            <h2 className="text-xl font-bold text-[#1a2e1a] mb-1">Payout bank details</h2>
            <p className="text-[#52796f] text-sm mb-6">
              This is the bank account FarmDirect uses to pay your daily earnings.
            </p>

            <div className="space-y-5">
              <div>
                <label className="block text-sm text-[#52796f] mb-1.5 font-medium">Account Holder Name *</label>
                <div className="relative">
                  <Building2 className="w-5 h-5 text-[#95d5b2] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={accountHolderName}
                    onChange={e => setAccountHolderName(e.target.value)}
                    onBlur={() => setBankTouched(true)}
                    placeholder="Name on the bank account"
                    className="w-full pl-10 pr-4 py-3 bg-[#f0f7f0] border border-transparent rounded-xl text-[#1a2e1a] text-sm focus:outline-none focus:border-[#2d6a4f] transition-colors"
                  />
                </div>
                {bankTouched && !holderValid && (
                  <p className="text-xs text-[#dc2626] mt-1">Account holder name is required</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-[#52796f] mb-1.5 font-medium">Account Number *</label>
                <div className="relative">
                  <CreditCard className="w-5 h-5 text-[#95d5b2] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={accountNumber}
                    onChange={e => setAccountNumber(e.target.value)}
                    onBlur={() => setBankTouched(true)}
                    placeholder="Bank account number"
                    className="w-full pl-10 pr-4 py-3 bg-[#f0f7f0] border border-transparent rounded-xl text-[#1a2e1a] text-sm focus:outline-none focus:border-[#2d6a4f] transition-colors"
                  />
                </div>
                {bankTouched && accountNumber && !accountValid && (
                  <p className="text-xs text-[#dc2626] mt-1">Enter a valid account number (9–18 digits)</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-[#52796f] mb-1.5 font-medium">IFSC Code *</label>
                <div className="relative">
                  <Hash className="w-5 h-5 text-[#95d5b2] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={ifscCode}
                    onChange={e => setIfscCode(e.target.value.toUpperCase())}
                    onBlur={() => setBankTouched(true)}
                    placeholder="e.g. HDFC0001234"
                    className="w-full pl-10 pr-4 py-3 bg-[#f0f7f0] border border-transparent rounded-xl text-[#1a2e1a] text-sm focus:outline-none focus:border-[#2d6a4f] transition-colors uppercase"
                  />
                </div>
                {bankTouched && ifscCode && !ifscValid && (
                  <p className="text-xs text-[#dc2626] mt-1">Enter a valid IFSC code (e.g. HDFC0001234)</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-[#52796f] mb-1.5 font-medium">UPI ID <span className="text-[#95d5b2]">(optional)</span></label>
                <div className="relative">
                  <Smartphone className="w-5 h-5 text-[#95d5b2] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                    onBlur={() => setBankTouched(true)}
                    placeholder="yourname@upi (for fast GPay payments)"
                    className="w-full pl-10 pr-4 py-3 bg-[#f0f7f0] border border-transparent rounded-xl text-[#1a2e1a] text-sm focus:outline-none focus:border-[#2d6a4f] transition-colors"
                  />
                </div>
                {bankTouched && upiId && !upiValid && (
                  <p className="text-xs text-[#dc2626] mt-1">Enter a valid UPI ID (e.g. name@bank)</p>
                )}
              </div>
            </div>
          </div>

            <button
              onClick={() => {
                setBankTouched(true);
                if (!bankValid) return;
                saveMutation.mutate({
                  account_holder_name: accountHolderName.trim(),
                  account_number: accountNumber.replace(/\s/g, ''),
                  ifsc_code: ifscCode.trim().toUpperCase(),
                  upi_id: upiId.trim() || undefined,
                });
              }}
              disabled={!bankValid || saveMutation.isPending}
              className="w-full mt-6 inline-flex items-center justify-center gap-2 bg-[#2d6a4f] text-white font-semibold py-3.5 px-8 rounded-2xl shadow-md hover:bg-[#1a4d3a] hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-60"
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Save & Continue
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

{saveMutation.isError && (
              <p className="text-sm text-[#dc2626] mt-3 text-center">Something went wrong. Please try again.</p>
            )}
          </>
        )}

        {(submitted || hasBankDetails) && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border border-[#d8f3dc] text-center">
            <div className="w-16 h-16 bg-[#dcfce7] rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-8 h-8 text-[#166534]" />
            </div>
            <h2 className="text-xl font-bold text-[#1a2e1a] mb-3">Bank details saved</h2>
            <p className="text-[#52796f] text-sm mb-6 max-w-md mx-auto">
              Your bank details are now saved. Daily payouts will be sent to this account.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-[#2d6a4f] text-white font-semibold py-3.5 px-8 rounded-2xl shadow-md hover:bg-[#1a4d3a] hover:shadow-lg transition-all active:scale-[0.97]"
            >
              Go to Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
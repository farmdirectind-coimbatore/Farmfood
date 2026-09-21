'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Mail, Phone, Landmark, LogOut, Save, Loader2, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface Profile {
  id: string;
  phone: string | null;
  address: string | null;
  pan_number: string | null;
  account_holder_name: string | null;
  account_number: string | null;
  ifsc_code: string | null;
  upi_id: string | null;
  user: {
    name: string | null;
    email: string;
    avatar_url: string | null;
    created_at: string;
  };
}

async function fetchProfile(): Promise<Profile> {
  const res = await fetch('/api/dashboard/profile');
  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
}

async function updateProfile(data: {
  phone?: string;
  account_holder_name?: string;
  account_number?: string;
  ifsc_code?: string;
  upi_id?: string;
}) {
  const res = await fetch('/api/dashboard/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update profile');
  return res.json();
}

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [dirtyFields, setDirtyFields] = useState<Record<string, string>>({});

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
  });

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setSaveStatus('saved');
      setDirtyFields({});
      setTimeout(() => setSaveStatus('idle'), 2000);
    },
    onError: () => {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    },
  });

  const handleSignOut = async () => {
    setIsSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  // Auto-save on change (debounced)
  const handleChange = (field: string, value: string) => {
    setDirtyFields(prev => ({ ...prev, [field]: value }));
    setSaveStatus('idle');

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      const payload: Record<string, string> = {};
      for (const [key, val] of Object.entries(dirtyFields)) {
        payload[key] = key === 'ifsc_code' ? val.toUpperCase() : val;
      }
      setSaveStatus('saving');
      updateMutation.mutate(payload);
    }, 800);
  };

  const handleBlur = (field: string, value: string) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    const payload: Record<string, string> = {};
    payload[field] = field === 'ifsc_code' ? value.toUpperCase() : value;
    setSaveStatus('saving');
    updateMutation.mutate(payload);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-[#d8f3dc] animate-pulse">
        <div className="h-4 bg-[#d8f3dc] rounded w-1/4 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-4 bg-[#d8f3dc] rounded" />)}
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-[#fecaca]">
        <p className="text-[#dc2626]">Failed to load profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl p-6 border border-[#d8f3dc]">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-[#d8f3dc] flex items-center justify-center flex-shrink-0 overflow-hidden relative">
            {profile.user.avatar_url ? (
              <Image
                src={profile.user.avatar_url}
                alt={profile.user.name || 'User'}
                fill
                className="object-cover rounded-2xl"
                sizes="80px"
              />
            ) : (
              <User className="w-10 h-10 text-[#2d6a4f]" />
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#1a2e1a]">
              {profile.user.name || 'User'}
            </h1>
            <p className="text-[#52796f] mt-1">{profile.user.email}</p>
            <p className="text-sm text-[#95d5b2] mt-1">
              Member since {new Date(profile.user.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="flex items-center gap-2 px-4 py-2 bg-[#fef2f2] text-[#dc2626] rounded-xl font-medium hover:bg-[#fecaca] transition-colors disabled:opacity-60"
          >
            {isSigningOut ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5" />}
            Sign Out
          </button>
        </div>
      </div>

      {/* Profile Form - Auto-save enabled */}
      <div className="bg-white rounded-2xl p-6 border border-[#d8f3dc]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#1a2e1a]">Profile Information</h2>
          <div className="flex items-center gap-2">
            {saveStatus === 'saving' && (
              <Loader2 className="w-4 h-4 animate-spin text-[#2d6a4f]" />
            )}
            {saveStatus === 'saved' && (
              <CheckCircle className="w-4 h-4 text-[#166534]" />
            )}
            {saveStatus === 'error' && (
              <span className="text-xs text-[#dc2626]">Save failed - retrying...</span>
            )}
            <span className="text-xs text-[#95d5b2]">Auto-save enabled</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm text-[#52796f] mb-1">Full Name</label>
              <input
                type="text"
                id="name"
                value={profile.user.name || ''}
                disabled
                className="w-full px-4 py-3 bg-[#f0f7f0] border border-[#d8f3dc] rounded-xl text-[#1a2e1a]"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm text-[#52796f] mb-1">Email</label>
              <input
                type="email"
                id="email"
                value={profile.user.email}
                disabled
                className="w-full px-4 py-3 bg-[#f0f7f0] border border-[#d8f3dc] rounded-xl text-[#1a2e1a]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm text-[#52796f] mb-1">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={(dirtyFields.phone ?? profile.phone) || ''}
              onChange={e => handleChange('phone', e.target.value)}
              onBlur={e => handleBlur('phone', e.target.value)}
              className="w-full px-4 py-3 bg-white border border-[#d8f3dc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent"
              placeholder="+91 XXXXX XXXXX"
            />
          </div>

          <div className="pt-4 border-t border-[#d8f3dc]">
            <h3 className="text-lg font-semibold text-[#1a2e1a] mb-4">Payout Bank Details</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="account_holder_name" className="block text-sm text-[#52796f] mb-1">Account Holder Name</label>
                <input
                  type="text"
                  id="account_holder_name"
                  name="account_holder_name"
                  value={(dirtyFields.account_holder_name ?? profile.account_holder_name) || ''}
                  onChange={e => handleChange('account_holder_name', e.target.value)}
                  onBlur={e => handleBlur('account_holder_name', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-[#d8f3dc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent"
                  placeholder="Name on the bank account"
                />
              </div>
              <div>
                <label htmlFor="account_number" className="block text-sm text-[#52796f] mb-1">Account Number</label>
                <input
                  type="text"
                  id="account_number"
                  name="account_number"
                  value={(dirtyFields.account_number ?? profile.account_number) || ''}
                  onChange={e => handleChange('account_number', e.target.value)}
                  onBlur={e => handleBlur('account_number', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-[#d8f3dc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent"
                  placeholder="Bank account number"
                />
              </div>
              <div>
                <label htmlFor="ifsc_code" className="block text-sm text-[#52796f] mb-1">IFSC Code</label>
                <input
                  type="text"
                  id="ifsc_code"
                  name="ifsc_code"
                  value={((dirtyFields.ifsc_code ?? profile.ifsc_code) || '').toUpperCase()}
                  onChange={e => handleChange('ifsc_code', e.target.value.toUpperCase())}
                  onBlur={e => handleBlur('ifsc_code', e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-white border border-[#d8f3dc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent uppercase"
                  placeholder="e.g. HDFC0001234"
                />
              </div>
              <div>
                <label htmlFor="upi_id" className="block text-sm text-[#52796f] mb-1">UPI ID <span className="text-[#95d5b2]">(optional)</span></label>
                <input
                  type="text"
                  id="upi_id"
                  name="upi_id"
                  value={(dirtyFields.upi_id ?? profile.upi_id) || ''}
                  onChange={e => handleChange('upi_id', e.target.value)}
                  onBlur={e => handleBlur('upi_id', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-[#d8f3dc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent"
                  placeholder="yourname@upi"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-2xl p-6 border border-[#d8f3dc]">
        <h3 className="text-lg font-semibold text-[#1a2e1a] mb-4">Account Details</h3>
        <div className="space-y-3">
          <InfoRow icon={Mail} label="Email" value={profile.user.email} />
          <InfoRow icon={Phone} label="Phone" value={profile.phone || 'Not set'} />
        </div>

        <h3 className="text-lg font-semibold text-[#1a2e1a] mt-6 mb-4">Payout Bank Details</h3>
        <div className="space-y-3">
          <InfoRow icon={User} label="Account Holder" value={profile.account_holder_name || 'Not set'} />
          <InfoRow icon={Landmark} label="Account Number" value={maskAccountNumber(profile.account_number)} />
          <InfoRow icon={Landmark} label="IFSC Code" value={profile.ifsc_code || 'Not set'} />
          <InfoRow icon={Phone} label="UPI ID" value={profile.upi_id || 'Not set'} />
        </div>
      </div>
    </div>
  );
}

function maskAccountNumber(value?: string | null): string {
  if (!value) return 'Not set';
  if (value.length <= 4) return value;
  return `••••${value.slice(-4)}`;
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 p-3 bg-[#fafdf7] rounded-xl">
      <div className="w-10 h-10 rounded-xl bg-[#d8f3dc] flex items-center justify-center">
        <Icon className="w-5 h-5 text-[#2d6a4f]" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-[#52796f]">{label}</p>
        <p className="font-medium text-[#1a2e1a]">{value}</p>
      </div>
    </div>
  );
}
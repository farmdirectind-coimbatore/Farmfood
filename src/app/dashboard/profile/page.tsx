'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Mail, Phone, LogOut, Save, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface Profile {
  id: string;
  phone: string | null;
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

async function updateProfile(data: { phone?: string }) {
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
  const [isEditing, setIsEditing] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
  });

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
  });

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setIsEditing(false);
    },
  });

  const handleSignOut = async () => {
    setIsSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl p-6 border border-[#d8f3dc]">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-[#d8f3dc] flex items-center justify-center flex-shrink-0 overflow-hidden">
            {profile.user.avatar_url ? (
              <img
                src={profile.user.avatar_url}
                alt={profile.user.name || 'User'}
                className="w-20 h-20 rounded-2xl object-cover"
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

      {/* Profile Form */}
      <div className="bg-white rounded-2xl p-6 border border-[#d8f3dc]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#1a2e1a]">Profile Information</h2>
          {isEditing ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    phone: profile.phone || '',
                  });
                  setIsEditing(false);
                }}
                className="px-4 py-2 bg-white border border-[#d8f3dc] text-[#52796f] rounded-xl font-medium hover:bg-[#f0f7f0] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="profile-form"
                disabled={updateMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-[#2d6a4f] text-white rounded-xl font-medium hover:bg-[#1a4d3a] transition-colors disabled:opacity-50"
              >
                {updateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setFormData({
                  phone: profile.phone || '',
                });
                setIsEditing(true);
              }}
              className="px-4 py-2 bg-[#2d6a4f] text-white rounded-xl font-medium hover:bg-[#1a4d3a] transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>

        <form id="profile-form" onSubmit={handleSubmit} className="space-y-4">
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
              value={formData.phone}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-4 py-3 bg-white border border-[#d8f3dc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent disabled:bg-[#f0f7f0]"
              placeholder="+91 XXXXX XXXXX"
            />
          </div>

          {isEditing && (
            <div className="pt-4 border-t border-[#d8f3dc] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    phone: profile.phone || '',
                  });
                  setIsEditing(false);
                }}
                className="px-4 py-2 bg-white border border-[#d8f3dc] text-[#52796f] rounded-xl font-medium hover:bg-[#f0f7f0] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-[#2d6a4f] text-white rounded-xl font-medium hover:bg-[#1a4d3a] transition-colors disabled:opacity-50"
              >
                {updateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-2xl p-6 border border-[#d8f3dc]">
        <h3 className="text-lg font-semibold text-[#1a2e1a] mb-4">Account Details</h3>
        <div className="space-y-3">
          <InfoRow icon={Mail} label="Email" value={profile.user.email} />
          <InfoRow icon={Phone} label="Phone" value={profile.phone || 'Not set'} />
        </div>
      </div>
    </div>
  );
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
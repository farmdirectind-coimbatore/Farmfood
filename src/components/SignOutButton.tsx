'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function SignOutButton({
  className = '',
  variant = 'outline',
  label = 'Sign Out',
}: {
  className?: string;
  variant?: 'outline' | 'light' | 'red';
  label?: string;
}) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const styles = {
    outline:
      'bg-transparent text-white/70 hover:bg-white/10 hover:text-white border border-white/15',
    light:
      'bg-white/10 text-white hover:bg-white/20 border border-white/15',
    red: 'bg-[#fef2f2] text-[#dc2626] hover:bg-[#fee2e2] border border-[#fecaca]',
  }[variant];

  return (
    <button
      onClick={handleSignOut}
      disabled={isSigningOut}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 ${styles} ${className}`}
      aria-label={label}
    >
      {isSigningOut ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <LogOut className="w-4 h-4" />
      )}
      {label}
    </button>
  );
}
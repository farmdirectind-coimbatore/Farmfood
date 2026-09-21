'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Loader2, Leaf } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" />}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?redirect=${encodeURIComponent(redirect)}`,
        },
      });
      if (error) setError(error.message);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#1a2e1a]">
      {/* Full-page farm video background (same as home page) */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        poster="/images/hero-farmland.png"
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/videos/hero-video.mp4" type="video/mp4" />
      </video>

      {/* dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60 z-10" />

      <div className="relative z-20 w-full px-4 sm:px-6 py-10 flex justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-5">
              <Image
                src="/images/logo.png"
                alt="FarmDirect Logo"
                width={168}
                height={56}
                className="mx-auto"
                priority
              />
            </Link>
            <h1 className="font-display text-3xl font-bold text-white">Welcome Back</h1>
            <p className="text-white/70 mt-2 text-sm">Sign in to access your farm investment dashboard</p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg">
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-6 bg-white border-2 border-[#d8f3dc] rounded-2xl font-semibold text-[#1a2e1a] hover:bg-[#f0f7f0] hover:border-[#2d6a4f] transition-all active:scale-[0.98] disabled:opacity-60"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              <span>Continue with Google</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            {error && (
              <p className="text-center text-sm text-[#dc2626] mt-4">{error}</p>
            )}

            <p className="text-center text-xs text-[#52796f] mt-6">
              By signing in, you agree to our{' '}
              <a href="/terms" className="text-[#2d6a4f] hover:underline">Terms</a>
              {' '}and{' '}
              <a href="/privacy" className="text-[#2d6a4f] hover:underline">Privacy Policy</a>
            </p>
          </div>

          <div className="text-center mt-8">
            <p className="text-xs text-white/70">
              New to FarmDirect?{' '}
              <Link href="/how-it-works" className="text-white font-medium hover:underline">
                See how it works
              </Link>
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Leaf className="w-4 h-4 text-[#95d5b2]" />
              <p className="text-xs text-white/60">FarmDirect - Fresh Farm Investment Platform</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
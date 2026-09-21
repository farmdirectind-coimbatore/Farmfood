'use client';

import { Suspense, useState, type FormEvent } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Loader2, Leaf, Lock, User } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/admin';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invalid username or password');
        return;
      }
      router.push(redirect);
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#1a2e1a]">
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
            <h1 className="font-display text-3xl font-bold text-white">Admin Login</h1>
            <p className="text-white/70 mt-2 text-sm">Restricted area - authorized personnel only</p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#52796f] mb-1.5">Username</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#95d5b2] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Enter admin username"
                    autoComplete="username"
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-[#f0f7f0] border border-transparent rounded-xl text-sm focus:outline-none focus:border-[#2d6a4f]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#52796f] mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#95d5b2] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    autoComplete="current-password"
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-[#f0f7f0] border border-transparent rounded-xl text-sm focus:outline-none focus:border-[#2d6a4f]"
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-[#dc2626] bg-[#fef2f2] border border-[#fecaca] rounded-xl px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-6 bg-[#2d6a4f] text-white rounded-2xl font-semibold hover:bg-[#1a4d3a] transition-all active:scale-[0.98] disabled:opacity-60"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Sign In to Admin
                  </>
                )}
                {!isLoading && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>

            <p className="text-center text-xs text-[#52796f] mt-6">
              <Link href="/" className="text-[#2d6a4f] hover:underline">Back to homepage</Link>
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 mt-8">
            <Leaf className="w-4 h-4 text-[#95d5b2]" />
            <p className="text-xs text-white/60">FarmDirect - Fresh Farm Investment Platform</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" />}>
      <LoginForm />
    </Suspense>
  );
}